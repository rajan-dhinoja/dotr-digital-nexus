import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isEditor, loading, user, session } = useAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRetries = 2;
  const retryDelay = 2000; // 2 seconds between retries

  // Retry logic: if we have a valid session but isEditor is false, wait and check again
  // This gives the AuthContext time to retry role checks
  useEffect(() => {
    // Clear any existing timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // If we're still loading, don't do anything
    if (loading) {
      return;
    }

    // If we have a valid session but isEditor is false, retry checking
    if (!isEditor && user && session && retryCount < maxRetries) {
      setIsRetrying(true);
      
      retryTimeoutRef.current = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setIsRetrying(false);
        // The AuthContext will handle the actual retry via its own retry logic
        // We're just giving it time and checking again
      }, retryDelay);

      return () => {
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }
      };
    } else if (!isEditor && (!user || !session)) {
      // No valid session - safe to redirect immediately (no retries needed)
      setShouldRedirect(true);
    } else if (!isEditor && retryCount >= maxRetries) {
      // Exhausted retries - redirect
      setShouldRedirect(true);
    } else if (isEditor) {
      // Success - reset retry state
      setRetryCount(0);
      setIsRetrying(false);
      setShouldRedirect(false);
    }
  }, [loading, isEditor, user, session, retryCount]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  if (loading || isRetrying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          {isRetrying && (
            <p className="text-sm text-muted-foreground">
              Verifying permissions... ({retryCount + 1}/{maxRetries})
            </p>
          )}
        </div>
      </div>
    );
  }

  // Only redirect if we've exhausted retries or there's no valid session
  if (!isEditor && shouldRedirect) {
    return <Navigate to="/admin/login" replace />;
  }

  // If we have a session but isEditor is false and we're still retrying, show loading
  if (!isEditor && user && session && !shouldRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
