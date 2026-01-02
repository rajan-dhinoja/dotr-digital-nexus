import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
const AUTH_TIMEOUT = 5000; // 5 second timeout for auth check

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkRole = async (userId: string, forceRefresh = false) => {
    // Check cache first
    const cached = rolesCache.get(userId);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setIsAdmin(cached.isAdmin);
      setIsEditor(cached.isEditor);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
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
    let isMounted = true;

    // Set a timeout to prevent infinite loading - using ref pattern to avoid stale closure
    const timeoutId = setTimeout(() => {
      if (isMounted) {
        console.warn('Auth initialization timeout - forcing loading to false');
        setLoading(false);
      }
    }, AUTH_TIMEOUT);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Only force refresh on sign in
        await checkRole(session.user.id, event === 'SIGNED_IN');
      } else {
        setIsAdmin(false);
        setIsEditor(false);
      }
      
      // Clear timeout and set loading false on any auth state change
      clearTimeout(timeoutId);
      setLoading(false);
    });

    // THEN get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!isMounted) return;
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await checkRole(session.user.id);
      }
      
      clearTimeout(timeoutId);
      setLoading(false);
    }).catch((err) => {
      console.error('Error getting session:', err);
      if (isMounted) {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
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
