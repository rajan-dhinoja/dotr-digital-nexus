import { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isEditor: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache roles in memory to avoid repeated DB calls
const rolesCache = new Map<string, { isAdmin: boolean; isEditor: boolean; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Small helper to make sure auth-related calls can never block the UI forever.
// If Supabase is slow or unreachable, we fail fast and let the app render
// instead of keeping the whole admin behind a perpetual loading spinner.
async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, context: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${context} timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const checkRole = async (userId: string, forceRefresh = false) => {
    // Check cache first
    const cached = rolesCache.get(userId);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setIsAdmin(cached.isAdmin);
      setIsEditor(cached.isEditor);
      return;
    }

    try {
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      const result = await withTimeout(
        Promise.resolve(queryPromise),
        8000,
        'Role check'
      );
      const { data, error } = result;
      
      if (error) {
        console.error('Error checking role:', error);
        setIsAdmin(false);
        setIsEditor(false);
        return;
      }
      
      const isAdminRole = data?.some(r => r.role === 'admin') ?? false;
      const isEditorRole = data?.some(r => r.role === 'admin' || r.role === 'editor') ?? false;
      
      // Update cache
      rolesCache.set(userId, { isAdmin: isAdminRole, isEditor: isEditorRole, timestamp: Date.now() });
      
      setIsAdmin(isAdminRole);
      setIsEditor(isEditorRole);
    } catch (err) {
      console.error('Error in checkRole:', err);
      setIsAdmin(false);
      setIsEditor(false);
    }
  };

  useEffect(() => {
    // Prevent double initialization in strict mode
    if (initializedRef.current) return;
    initializedRef.current = true;

    let isMounted = true;

    // Initialize auth immediately
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await withTimeout(supabase.auth.getSession(), 8000, 'Auth session');

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkRole(session.user.id);
        }
      } catch (err) {
        console.error('Error getting session:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Start initialization
    initializeAuth();

    // Set up auth state listener for subsequent changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkRole(session.user.id, event === 'SIGNED_IN');
      } else {
        setIsAdmin(false);
        setIsEditor(false);
      }
      
      // Always ensure loading is false after auth state change
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsEditor(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isEditor, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
