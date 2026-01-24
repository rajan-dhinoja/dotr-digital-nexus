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

// LocalStorage keys for persistent role cache
const ROLE_CACHE_KEY_PREFIX = 'auth_role_cache_';
const ROLE_CACHE_EXPIRY_KEY_PREFIX = 'auth_role_cache_expiry_';

// Enhanced logging helper
const logAuthEvent = (event: string, data?: any) => {
  if (import.meta.env.DEV) {
    console.log(`[Auth] ${event}`, data || '');
  }
};

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

// Helper to check if error is an auth-related error (should clear roles)
function isAuthError(error: any): boolean {
  if (!error) return false;
  
  // Check for JWT/auth related error codes
  const authErrorIndicators = [
    'JWT',
    'jwt',
    'token',
    'unauthorized',
    'authentication',
    'PGRST116', // PostgREST JWT error
    'invalid_token',
    'expired_token',
  ];
  
  const errorMessage = error.message || error.toString() || '';
  const errorCode = error.code || '';
  
  return authErrorIndicators.some(indicator => 
    errorMessage.includes(indicator) || errorCode.includes(indicator)
  );
}

// Helper to check if error is a transient/retryable error
function isTransientError(error: any): boolean {
  if (!error) return false;
  
  const transientIndicators = [
    'timeout',
    'network',
    'fetch',
    'ECONNREFUSED',
    'ENOTFOUND',
    'ETIMEDOUT',
    'Failed to fetch',
  ];
  
  const errorMessage = error.message || error.toString() || '';
  
  return transientIndicators.some(indicator => errorMessage.includes(indicator));
}

// Load role cache from localStorage
function loadRoleCacheFromStorage(userId: string): { isAdmin: boolean; isEditor: boolean } | null {
  try {
    const cacheKey = `${ROLE_CACHE_KEY_PREFIX}${userId}`;
    const expiryKey = `${ROLE_CACHE_EXPIRY_KEY_PREFIX}${userId}`;
    
    const cachedData = localStorage.getItem(cacheKey);
    const expiryStr = localStorage.getItem(expiryKey);
    
    if (!cachedData || !expiryStr) return null;
    
    const expiry = parseInt(expiryStr, 10);
    if (Date.now() > expiry) {
      // Cache expired, remove it
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(expiryKey);
      return null;
    }
    
    return JSON.parse(cachedData);
  } catch (err) {
    logAuthEvent('Error loading role cache from storage', err);
    return null;
  }
}

// Save role cache to localStorage
function saveRoleCacheToStorage(userId: string, isAdmin: boolean, isEditor: boolean) {
  try {
    const cacheKey = `${ROLE_CACHE_KEY_PREFIX}${userId}`;
    const expiryKey = `${ROLE_CACHE_EXPIRY_KEY_PREFIX}${userId}`;
    const expiry = Date.now() + CACHE_DURATION;
    
    localStorage.setItem(cacheKey, JSON.stringify({ isAdmin, isEditor }));
    localStorage.setItem(expiryKey, expiry.toString());
  } catch (err) {
    logAuthEvent('Error saving role cache to storage', err);
  }
}

// Clear role cache from localStorage
function clearRoleCacheFromStorage(userId: string) {
  try {
    const cacheKey = `${ROLE_CACHE_KEY_PREFIX}${userId}`;
    const expiryKey = `${ROLE_CACHE_EXPIRY_KEY_PREFIX}${userId}`;
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(expiryKey);
  } catch (err) {
    logAuthEvent('Error clearing role cache from storage', err);
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditor, setIsEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const initializedRef = useRef(false);

  const checkRole = async (userId: string, forceRefresh = false) => {
    logAuthEvent('checkRole started', { userId, forceRefresh });
    
    // Check in-memory cache first
    const cached = rolesCache.get(userId);
    if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      logAuthEvent('Using in-memory cache', { userId });
      setIsAdmin(cached.isAdmin);
      setIsEditor(cached.isEditor);
      return;
    }

    // Check localStorage cache if in-memory cache is stale or missing
    if (!forceRefresh) {
      const storageCache = loadRoleCacheFromStorage(userId);
      if (storageCache) {
        logAuthEvent('Using localStorage cache', { userId });
        // Restore to in-memory cache
        rolesCache.set(userId, { 
          ...storageCache, 
          timestamp: Date.now() 
        });
        setIsAdmin(storageCache.isAdmin);
        setIsEditor(storageCache.isEditor);
        // Still try to refresh in background, but don't block
        checkRole(userId, true).catch(() => {
          // Background refresh failed, but we have cached values
        });
        return;
      }
    }

    // Get current state to preserve on transient errors
    const currentState = {
      isAdmin: rolesCache.get(userId)?.isAdmin ?? false,
      isEditor: rolesCache.get(userId)?.isEditor ?? false,
    };

    // Retry logic with exponential backoff
    const maxRetries = 3;
    const baseTimeout = 15000; // Increased from 8000ms
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        logAuthEvent('Role check attempt', { userId, attempt: attempt + 1, maxRetries });
        
        const queryPromise = supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);
        
        const result = await withTimeout(
          Promise.resolve(queryPromise),
          baseTimeout,
          'Role check'
        );
        
        const { data, error } = result;
        
        if (error) {
          logAuthEvent('Role check error', { userId, error, attempt: attempt + 1 });
          
          // Check if it's an auth error (should clear roles)
          if (isAuthError(error)) {
            logAuthEvent('Auth error detected, clearing roles', { userId, error });
            setIsAdmin(false);
            setIsEditor(false);
            rolesCache.delete(userId);
            clearRoleCacheFromStorage(userId);
            return;
          }
          
          // For other errors, retry if transient
          if (isTransientError(error) && attempt < maxRetries - 1) {
            lastError = error;
            const backoffDelay = Math.pow(2, attempt) * 1000; // Exponential backoff
            logAuthEvent('Transient error, retrying', { userId, attempt: attempt + 1, backoffDelay });
            await new Promise(resolve => setTimeout(resolve, backoffDelay));
            continue;
          }
          
          // Non-retryable error or max retries reached
          lastError = error;
          break;
        }
        
        // Success - process the data
        if (data !== null && data !== undefined) {
          const isAdminRole = data.some(r => r.role === 'admin') ?? false;
          const isEditorRole = data.some(r => r.role === 'admin' || r.role === 'editor') ?? false;
          
          logAuthEvent('Role check success', { userId, isAdminRole, isEditorRole });
          
          // Update both in-memory and localStorage cache
          const cacheEntry = { isAdmin: isAdminRole, isEditor: isEditorRole, timestamp: Date.now() };
          rolesCache.set(userId, cacheEntry);
          saveRoleCacheToStorage(userId, isAdminRole, isEditorRole);
          
          setIsAdmin(isAdminRole);
          setIsEditor(isEditorRole);
          return;
        }
        
        // No data returned - user has no roles
        logAuthEvent('No roles found for user', { userId });
        setIsAdmin(false);
        setIsEditor(false);
        rolesCache.set(userId, { isAdmin: false, isEditor: false, timestamp: Date.now() });
        saveRoleCacheToStorage(userId, false, false);
        return;
        
      } catch (err) {
        lastError = err as Error;
        logAuthEvent('Role check exception', { userId, error: err, attempt: attempt + 1 });
        
        // Check if it's a timeout or network error (retryable)
        if (isTransientError(err) && attempt < maxRetries - 1) {
          const backoffDelay = Math.pow(2, attempt) * 1000;
          logAuthEvent('Transient exception, retrying', { userId, attempt: attempt + 1, backoffDelay });
          await new Promise(resolve => setTimeout(resolve, backoffDelay));
          continue;
        }
        
        // Non-retryable error or max retries reached
        break;
      }
    }
    
    // All retries failed - preserve last known good state
    logAuthEvent('Role check failed after retries', { userId, error: lastError });
    
    // Try to use cached values (in-memory or localStorage)
    const fallbackCache = rolesCache.get(userId) || loadRoleCacheFromStorage(userId);
    
    if (fallbackCache) {
      logAuthEvent('Using cached values after failure', { userId });
      const cacheEntry = typeof fallbackCache === 'object' && 'timestamp' in fallbackCache
        ? fallbackCache
        : { ...fallbackCache, timestamp: Date.now() };
      
      if ('timestamp' in cacheEntry) {
        rolesCache.set(userId, cacheEntry as { isAdmin: boolean; isEditor: boolean; timestamp: number });
      }
      
      setIsAdmin(fallbackCache.isAdmin);
      setIsEditor(fallbackCache.isEditor);
    } else if (currentState.isAdmin || currentState.isEditor) {
      // Preserve current state if we have one
      logAuthEvent('Preserving current state after failure', { userId, currentState });
      setIsAdmin(currentState.isAdmin);
      setIsEditor(currentState.isEditor);
    } else {
      // Only clear if we have no cached value and no current state
      logAuthEvent('No cache available, clearing roles', { userId });
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
        logAuthEvent('Initializing auth');
        const {
          data: { session },
        } = await withTimeout(supabase.auth.getSession(), 15000, 'Auth session');

        if (!isMounted) return;

        logAuthEvent('Session retrieved', { hasSession: !!session, userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await checkRole(session.user.id);
        } else {
          setIsAdmin(false);
          setIsEditor(false);
        }
      } catch (err) {
        logAuthEvent('Error getting session', err);
        console.error('Error getting session:', err);
        // On initialization error, try to load from cache
        try {
          const { data: { session: cachedSession } } = await supabase.auth.getSession();
          if (cachedSession?.user) {
            const cachedRoles = loadRoleCacheFromStorage(cachedSession.user.id);
            if (cachedRoles) {
              logAuthEvent('Using cached roles after init error', { userId: cachedSession.user.id });
              setSession(cachedSession);
              setUser(cachedSession.user);
              setIsAdmin(cachedRoles.isAdmin);
              setIsEditor(cachedRoles.isEditor);
            }
          }
        } catch (cacheErr) {
          logAuthEvent('Error loading cached session', cacheErr);
        }
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
      
      logAuthEvent('Auth state change', { event, hasSession: !!session, userId: session?.user?.id });
      
      // Handle TOKEN_REFRESHED separately - don't re-check roles
      if (event === 'TOKEN_REFRESHED') {
        logAuthEvent('Token refreshed', { userId: session?.user?.id });
        setSession(session);
        setUser(session?.user ?? null);
        // Keep existing role state - don't re-check roles on token refresh
        // This prevents unnecessary role checks and potential false logouts
        setLoading(false);
        return;
      }
      
      // Handle SIGNED_OUT explicitly
      if (event === 'SIGNED_OUT' || !session) {
        logAuthEvent('User signed out', { event });
        setSession(null);
        setUser(null);
        setIsAdmin(false);
        setIsEditor(false);
        
        // Clear all caches
        if (user?.id) {
          rolesCache.delete(user.id);
          clearRoleCacheFromStorage(user.id);
        }
        
        setLoading(false);
        return;
      }
      
      // Handle SIGNED_IN and other events
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        // Only re-check roles on SIGNED_IN event, not on every auth state change
        // This prevents unnecessary role checks during normal operation
        if (event === 'SIGNED_IN') {
          logAuthEvent('User signed in, checking roles', { userId: session.user.id });
          await checkRole(session.user.id, true); // Force refresh on sign in
        } else {
          // For other events (like USER_UPDATED), keep existing role state
          // Only update if we don't have roles yet
          const cached = rolesCache.get(session.user.id) || loadRoleCacheFromStorage(session.user.id);
          if (!cached) {
            logAuthEvent('No cached roles, checking', { userId: session.user.id });
            await checkRole(session.user.id);
          } else {
            logAuthEvent('Keeping existing roles', { userId: session.user.id });
          }
        }
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
    logAuthEvent('Signing out', { userId: user?.id });
    
    // Clear caches before signing out
    if (user?.id) {
      rolesCache.delete(user.id);
      clearRoleCacheFromStorage(user.id);
    }
    
    await supabase.auth.signOut();
    setIsAdmin(false);
    setIsEditor(false);
    setUser(null);
    setSession(null);
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
