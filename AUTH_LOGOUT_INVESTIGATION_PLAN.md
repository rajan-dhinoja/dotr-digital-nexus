# Authentication Logout Investigation & Implementation Plan

## Executive Summary

This document provides a systematic investigation plan and prioritized fixes for unexpected logout issues in the React + TypeScript + Supabase admin panel. The analysis identifies critical vulnerabilities in the current authentication flow that cause premature logouts during normal usage.

---

## PART 1: SYSTEMATIC INVESTIGATION PLAN

### Phase 1: Supabase Auth Session Handling Investigation

#### 1.1 Access Token Expiration Analysis
**Investigation Steps:**
- [ ] Check Supabase dashboard for JWT expiration settings (default: 3600 seconds / 1 hour)
- [ ] Verify access token expiration time in browser DevTools → Application → Local Storage → `sb-*-auth-token`
- [ ] Log `session.expires_at` and `session.expires_in` values in AuthContext
- [ ] Monitor token expiration timing during active sessions
- [ ] Check if tokens expire faster than expected

**Tools:**
- Browser DevTools → Application → Local Storage
- Console logging: `session.expires_at`, `session.expires_in`
- Supabase Dashboard → Authentication → Settings

**Expected Findings:**
- Access tokens typically expire after 1 hour
- Refresh tokens typically expire after 30 days (configurable)

#### 1.2 Refresh Token Expiration & Auto-Refresh Configuration
**Investigation Steps:**
- [ ] Verify `autoRefreshToken: true` is working (already set in `client.ts`)
- [ ] Check if refresh token expiration is causing logouts
- [ ] Monitor `onAuthStateChange` events for `TOKEN_REFRESHED` events
- [ ] Test refresh token behavior when access token expires
- [ ] Check Supabase dashboard for refresh token rotation settings

**Current Configuration:**
```typescript
// src/integrations/supabase/client.ts
auth: {
  storage: localStorage,
  persistSession: true,
  autoRefreshToken: true,  // ✅ Already enabled
}
```

**Potential Issues:**
- Refresh token might be expiring unexpectedly
- Auto-refresh might be failing silently
- Network issues during refresh might cause logout

#### 1.3 Session Persistence Settings
**Investigation Steps:**
- [ ] Verify localStorage persistence is working
- [ ] Check if localStorage is being cleared unexpectedly
- [ ] Test session persistence across page reloads
- [ ] Check for browser extensions clearing storage
- [ ] Verify no code is calling `localStorage.clear()` or removing auth keys

**Current Configuration:**
- Using `localStorage` for session storage ✅
- `persistSession: true` ✅

**Potential Issues:**
- Browser privacy settings clearing localStorage
- Extensions (ad blockers, privacy tools) clearing storage
- Code accidentally clearing localStorage

#### 1.4 Session Storage vs Memory vs Cookie Analysis
**Investigation Steps:**
- [ ] Verify localStorage is the correct choice (vs sessionStorage)
- [ ] Check if multiple tabs are interfering with each other
- [ ] Test behavior with multiple admin panel tabs open
- [ ] Check for SameSite cookie issues (if cookies are used by Supabase)

**Current Implementation:**
- Using `localStorage` (persists across tabs and browser restarts)
- No cookie-based storage

---

### Phase 2: Frontend Auth Context Logic Investigation

#### 2.1 Session Initialization Logic Analysis
**Current Implementation Review:**
```typescript
// src/contexts/AuthContext.tsx:102-123
const initializeAuth = async () => {
  try {
    const { data: { session } } = await withTimeout(
      supabase.auth.getSession(), 
      8000, 
      'Auth session'
    );
    // ... sets session and user
    if (session?.user) {
      await checkRole(session.user.id);
    }
  } catch (err) {
    console.error('Error getting session:', err);
    // ⚠️ ISSUE: On timeout, session remains null, but loading is set to false
  }
}
```

**Investigation Steps:**
- [ ] Add detailed logging for initialization flow
- [ ] Check if timeout (8 seconds) is too aggressive
- [ ] Verify what happens when `getSession()` times out
- [ ] Test behavior with slow network conditions
- [ ] Check if initialization completes before role check

**Potential Issues Identified:**
1. **Timeout too short**: 8 seconds might be insufficient on slow networks
2. **Silent failure**: On timeout, session is null but app continues
3. **Race condition**: `onAuthStateChange` might fire before initialization completes

#### 2.2 Token Refresh Timing Analysis
**Investigation Steps:**
- [ ] Monitor `onAuthStateChange` events for `TOKEN_REFRESHED`
- [ ] Check if token refresh triggers role re-check unnecessarily
- [ ] Verify token refresh doesn't cause temporary `isEditor = false`
- [ ] Test token refresh during active usage
- [ ] Check timing of refresh relative to token expiration

**Current Implementation:**
```typescript
// src/contexts/AuthContext.tsx:129-144
supabase.auth.onAuthStateChange(async (event, session) => {
  setSession(session);
  setUser(session?.user ?? null);
  
  if (session?.user) {
    await checkRole(session.user.id, event === 'SIGNED_IN');
  } else {
    setIsAdmin(false);
    setIsEditor(false);  // ⚠️ This might fire during token refresh
  }
  setLoading(false);
});
```

**Critical Issue:**
- `onAuthStateChange` fires for ALL auth events, including `TOKEN_REFRESHED`
- During token refresh, if there's a brief moment where session is null, `isEditor` gets set to false
- This causes immediate logout via `ProtectedRoute`

#### 2.3 Race Conditions During App Load
**Investigation Steps:**
- [ ] Check if `initializeAuth` and `onAuthStateChange` conflict
- [ ] Verify order of operations during app startup
- [ ] Test React Strict Mode double-render behavior
- [ ] Check if multiple role checks run simultaneously

**Current Safeguards:**
- `initializedRef` prevents double initialization ✅
- `isMounted` flag prevents state updates after unmount ✅

**Potential Issues:**
- Both `initializeAuth` and `onAuthStateChange` might call `checkRole` simultaneously
- Race condition between session initialization and role check

#### 2.4 Timeout or Fallback Logout Logic
**Investigation Steps:**
- [ ] Check if `withTimeout` errors trigger logout
- [ ] Verify what happens when role check times out
- [ ] Test network failure scenarios
- [ ] Check for any automatic logout on errors

**Current Implementation:**
```typescript
// src/contexts/AuthContext.tsx:50-92
const checkRole = async (userId: string, forceRefresh = false) => {
  // ... cache check ...
  
  try {
    const result = await withTimeout(queryPromise, 8000, 'Role check');
    // ...
  } catch (err) {
    console.error('Error in checkRole:', err);
    setIsAdmin(false);
    setIsEditor(false);  // ⚠️ CRITICAL: Sets isEditor=false on ANY error
  }
}
```

**CRITICAL ISSUE IDENTIFIED:**
- **Line 89-90**: On ANY error (timeout, network failure, DB error), `isEditor` is set to `false`
- This immediately triggers logout via `ProtectedRoute`
- No distinction between temporary errors and permanent auth failures

#### 2.5 Error Handling That Forces Logout
**Investigation Steps:**
- [ ] Review all error paths in `checkRole`
- [ ] Check if database errors cause logout
- [ ] Verify network errors don't trigger logout
- [ ] Test behavior when Supabase is temporarily unavailable

**Error Scenarios:**
1. **Network timeout** → Currently logs out ❌
2. **Database query error** → Currently logs out ❌
3. **Supabase service unavailable** → Currently logs out ❌
4. **Role check timeout** → Currently logs out ❌

**All of these should NOT cause logout!**

#### 2.6 Role-Fetch Failures Causing Forced Logout
**Investigation Steps:**
- [ ] Test behavior when `user_roles` table is temporarily unavailable
- [ ] Check if RLS (Row Level Security) policies cause issues
- [ ] Verify role check doesn't fail due to permissions
- [ ] Test with invalid user_id scenarios

**Current Behavior:**
- Any error in role check → `isEditor = false` → Logout
- This is incorrect: role fetch failure ≠ auth failure

---

### Phase 3: Protected Route Logic Investigation

#### 3.1 Conditions That Trigger Redirect to Login
**Current Implementation:**
```typescript
// src/components/admin/ProtectedRoute.tsx
if (!isEditor) {
  return <Navigate to="/admin/login" replace />;
}
```

**Investigation Steps:**
- [ ] Log all instances where `isEditor` becomes false
- [ ] Check if `isEditor` is false during loading states
- [ ] Verify timing of `isEditor` updates
- [ ] Test if temporary `isEditor = false` causes redirect

**Critical Issue:**
- `ProtectedRoute` immediately redirects if `isEditor` is false
- No distinction between "not loaded yet" vs "not authorized"
- No retry mechanism

#### 3.2 Role or Permission Checks Failing Temporarily
**Investigation Steps:**
- [ ] Monitor `isEditor` state changes during normal usage
- [ ] Check if role checks fail intermittently
- [ ] Test behavior during database maintenance
- [ ] Verify RLS policies don't cause intermittent failures

#### 3.3 Page Reload Behavior
**Investigation Steps:**
- [ ] Test hard refresh (Ctrl+F5) behavior
- [ ] Check if session is lost on reload
- [ ] Verify role cache persists across reloads (it doesn't - it's in-memory)
- [ ] Test behavior when localStorage has session but role check fails

**Current Issue:**
- Role cache is in-memory only → Lost on page reload
- On reload, role must be fetched again
- If role fetch fails on reload → Logout

#### 3.4 Multiple Auth Checks Running in Parallel
**Investigation Steps:**
- [ ] Check if multiple components call `useAuth()` simultaneously
- [ ] Verify if multiple role checks run at once
- [ ] Test if parallel checks cause race conditions

---

### Phase 4: Browser & Environment Factors

#### 4.1 Storage Clearing Investigation
**Investigation Steps:**
- [ ] Check browser console for storage errors
- [ ] Test with browser privacy mode
- [ ] Check for extensions clearing storage
- [ ] Verify localStorage quota isn't exceeded

#### 4.2 SameSite Cookie Issues
**Investigation Steps:**
- [ ] Check if Supabase uses cookies (it might for refresh tokens)
- [ ] Verify SameSite cookie settings
- [ ] Test cross-origin scenarios if applicable

#### 4.3 Tab Refresh vs Hard Reload Behavior
**Investigation Steps:**
- [ ] Test normal refresh (F5)
- [ ] Test hard refresh (Ctrl+F5)
- [ ] Test closing and reopening tab
- [ ] Compare behavior differences

#### 4.4 Multiple Tabs Interaction
**Investigation Steps:**
- [ ] Test with multiple admin panel tabs open
- [ ] Check if logout in one tab affects others
- [ ] Verify localStorage synchronization across tabs
- [ ] Test `storage` event handling

#### 4.5 Dev vs Production Behavior Differences
**Investigation Steps:**
- [ ] Compare dev and production behavior
- [ ] Check environment-specific configurations
- [ ] Verify Supabase project settings match between environments

---

## PART 2: ROOT CAUSE HYPOTHESIS LIST

### High-Confidence Hypotheses (Based on Code Analysis)

#### Hypothesis 1: Role Check Failures Cause Immediate Logout ⚠️ **CRITICAL**
**Confidence:** 95%
**Evidence:**
- `checkRole` sets `isEditor = false` on ANY error (lines 74-75, 89-90)
- `ProtectedRoute` redirects immediately when `isEditor` is false
- No distinction between temporary errors and permanent failures

**Impact:** HIGH - Any network hiccup, timeout, or DB error logs user out

#### Hypothesis 2: Token Refresh Events Triggering Role Re-Check ⚠️ **HIGH**
**Confidence:** 85%
**Evidence:**
- `onAuthStateChange` fires for `TOKEN_REFRESHED` events
- Role check runs on every auth state change
- If role check fails during refresh → Logout

**Impact:** HIGH - Token refresh happens every hour, increasing failure probability

#### Hypothesis 3: Race Condition Between Initialization and Auth State Listener ⚠️ **MEDIUM**
**Confidence:** 70%
**Evidence:**
- Both `initializeAuth` and `onAuthStateChange` can call `checkRole`
- No synchronization between them
- Potential for conflicting state updates

**Impact:** MEDIUM - Could cause intermittent issues

#### Hypothesis 4: Timeout Too Aggressive ⚠️ **MEDIUM**
**Confidence:** 65%
**Evidence:**
- 8-second timeout for session and role checks
- Slow networks or DB queries might exceed this
- Timeout → Error → Logout

**Impact:** MEDIUM - Affects users on slow networks

#### Hypothesis 5: Role Cache Lost on Page Reload ⚠️ **MEDIUM**
**Confidence:** 80%
**Evidence:**
- Role cache is in-memory only
- On reload, role must be fetched again
- If fetch fails → Logout

**Impact:** MEDIUM - Every page reload is a potential logout point

### Lower-Confidence Hypotheses (Require Investigation)

#### Hypothesis 6: Supabase Auto-Refresh Failing Silently
**Confidence:** 40%
**Evidence:** None yet - requires monitoring

#### Hypothesis 7: localStorage Being Cleared
**Confidence:** 30%
**Evidence:** None yet - requires investigation

#### Hypothesis 8: Multiple Tabs Interfering
**Confidence:** 25%
**Evidence:** None yet - requires testing

---

## PART 3: RECOMMENDED FIXES (Prioritized)

### Priority 1: Critical Fixes (Implement Immediately)

#### Fix 1.1: Separate Auth Failure from Role Fetch Failure ⚠️ **CRITICAL**
**Problem:** `checkRole` sets `isEditor = false` on ANY error, causing logout

**Solution:**
- Distinguish between auth failures and role fetch failures
- On role fetch error, preserve previous `isEditor` state (use cached value)
- Only set `isEditor = false` if:
  - User is explicitly not authorized (DB returns empty roles)
  - Auth session is invalid (user is null)
- Add retry logic for transient failures

**Implementation Approach:**
1. Add error type detection (network vs auth vs DB)
2. Preserve last known good role state on transient errors
3. Implement exponential backoff retry for role checks
4. Add fallback to cached role on error

**Security Impact:** LOW - Maintains security while improving UX

#### Fix 1.2: Handle Token Refresh Events Properly ⚠️ **CRITICAL**
**Problem:** `onAuthStateChange` treats all events the same, including `TOKEN_REFRESHED`

**Solution:**
- Filter `onAuthStateChange` events
- For `TOKEN_REFRESHED` events:
  - Don't re-check roles (use cache)
  - Don't reset `isEditor` state
  - Only update session if needed
- Only re-check roles on `SIGNED_IN` or explicit auth changes

**Implementation Approach:**
```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  // Handle different event types appropriately
  if (event === 'TOKEN_REFRESHED') {
    // Update session, but don't re-check roles
    setSession(session);
    setUser(session?.user ?? null);
    // Keep existing isEditor/isAdmin state
    return;
  }
  
  if (event === 'SIGNED_OUT' || !session) {
    // Only clear roles on explicit sign out
    setIsAdmin(false);
    setIsEditor(false);
  }
  
  // ... rest of logic
});
```

**Security Impact:** NONE - Maintains security, improves stability

#### Fix 1.3: Add Graceful Error Handling in ProtectedRoute ⚠️ **HIGH**
**Problem:** `ProtectedRoute` immediately redirects on `isEditor = false`, even during loading

**Solution:**
- Add retry mechanism before redirecting
- Distinguish between "loading" and "unauthorized"
- Show error message before redirecting
- Allow retry of role check

**Implementation Approach:**
1. Add retry counter/state
2. Show "Checking permissions..." message
3. Retry role check before redirecting
4. Only redirect after confirmed unauthorized

**Security Impact:** NONE - Maintains security, improves UX

### Priority 2: Important Fixes (Implement Soon)

#### Fix 2.1: Persist Role Cache Across Page Reloads
**Problem:** Role cache is in-memory, lost on reload

**Solution:**
- Store role cache in localStorage (with expiration)
- Restore cache on app initialization
- Validate cache freshness before using

**Security Impact:** LOW - Cache is validated on each check

#### Fix 2.2: Increase Timeout Values with Retry Logic
**Problem:** 8-second timeout might be too aggressive

**Solution:**
- Increase timeout to 15-20 seconds
- Add exponential backoff retry
- Show loading state during retries

**Security Impact:** NONE

#### Fix 2.3: Add Comprehensive Logging
**Problem:** Difficult to debug logout issues

**Solution:**
- Add detailed logging for all auth events
- Log role check attempts and results
- Log token refresh events
- Add error tracking

**Security Impact:** NONE (ensure no sensitive data in logs)

### Priority 3: Nice-to-Have Improvements

#### Fix 3.1: Add Session Health Monitoring
- Monitor token expiration times
- Alert when refresh is about to fail
- Proactive session management

#### Fix 3.2: Add Offline Support
- Cache roles for offline use
- Queue role checks when offline
- Sync when connection restored

#### Fix 3.3: Improve Loading States
- Better UX during auth initialization
- Show progress during role checks
- Prevent UI flicker during state changes

---

## PART 4: SECURITY IMPACT ASSESSMENT

### Security Considerations for Each Fix

#### Fix 1.1: Separate Auth from Role Failures
**Security Risk:** LOW
**Mitigation:**
- Only preserve role state for transient errors (network, timeout)
- Always validate on successful role check
- Clear roles on explicit auth failures
- Maintain role cache expiration (5 minutes)

**Recommendation:** ✅ Safe to implement

#### Fix 1.2: Handle Token Refresh Properly
**Security Risk:** NONE
**Mitigation:**
- Token refresh is a security feature, not a risk
- Proper handling improves security by maintaining valid sessions

**Recommendation:** ✅ Safe to implement

#### Fix 1.3: Graceful Error Handling
**Security Risk:** LOW
**Mitigation:**
- Limit retry attempts (max 2-3 retries)
- Timeout retries quickly
- Always redirect if unauthorized after retries

**Recommendation:** ✅ Safe to implement

#### Fix 2.1: Persist Role Cache
**Security Risk:** LOW-MEDIUM
**Mitigation:**
- Cache with short expiration (5 minutes)
- Always validate cache on app load
- Clear cache on explicit logout
- Don't cache sensitive permissions

**Recommendation:** ✅ Safe with proper expiration

### Overall Security Posture

**Current State:**
- ✅ Supabase handles token security
- ✅ Auto-refresh enabled
- ✅ Session persistence enabled
- ⚠️ Role checks might be too aggressive (causing false logouts)

**After Fixes:**
- ✅ All security features maintained
- ✅ Better error handling (doesn't weaken security)
- ✅ Improved session stability
- ✅ Better user experience without compromising security

**Conclusion:** All recommended fixes maintain or improve security while fixing stability issues.

---

## PART 5: IMPLEMENTATION CHECKLIST

### Phase 1: Critical Fixes (Week 1)

- [ ] **Fix 1.1**: Refactor `checkRole` to preserve state on transient errors
  - [ ] Add error type detection
  - [ ] Implement state preservation logic
  - [ ] Add retry mechanism with exponential backoff
  - [ ] Test with network failures
  - [ ] Test with DB errors
  - [ ] Test with timeouts

- [ ] **Fix 1.2**: Filter `onAuthStateChange` events
  - [ ] Add event type checking
  - [ ] Handle `TOKEN_REFRESHED` separately
  - [ ] Test token refresh flow
  - [ ] Verify roles aren't cleared on refresh

- [ ] **Fix 1.3**: Improve `ProtectedRoute` error handling
  - [ ] Add retry logic
  - [ ] Add loading/error states
  - [ ] Test redirect behavior
  - [ ] Test with various error scenarios

### Phase 2: Important Fixes (Week 2)

- [ ] **Fix 2.1**: Persist role cache
  - [ ] Implement localStorage cache
  - [ ] Add cache validation
  - [ ] Test across page reloads
  - [ ] Test cache expiration

- [ ] **Fix 2.2**: Increase timeouts with retry
  - [ ] Adjust timeout values
  - [ ] Implement retry logic
  - [ ] Test on slow networks

- [ ] **Fix 2.3**: Add comprehensive logging
  - [ ] Add auth event logging
  - [ ] Add role check logging
  - [ ] Add error tracking
  - [ ] Test logging in dev/prod

### Phase 3: Testing & Validation (Week 3)

- [ ] **Test Suite 1**: Long Active Sessions
  - [ ] Test 2+ hour active session
  - [ ] Monitor token refreshes
  - [ ] Verify no unexpected logouts

- [ ] **Test Suite 2**: Idle Sessions
  - [ ] Test session after 30+ minutes idle
  - [ ] Test token refresh during idle
  - [ ] Verify session persists

- [ ] **Test Suite 3**: Page Reloads
  - [ ] Test normal refresh (F5)
  - [ ] Test hard refresh (Ctrl+F5)
  - [ ] Test closing/reopening tab
  - [ ] Verify session persists

- [ ] **Test Suite 4**: Multiple Tabs
  - [ ] Test with 2+ tabs open
  - [ ] Test logout in one tab
  - [ ] Test refresh in one tab
  - [ ] Verify synchronization

- [ ] **Test Suite 5**: Token Expiration Edge Cases
  - [ ] Test access token expiration
  - [ ] Test refresh token expiration
  - [ ] Test refresh failure scenarios
  - [ ] Verify graceful handling

- [ ] **Test Suite 6**: Error Scenarios
  - [ ] Test network failures
  - [ ] Test DB unavailability
  - [ ] Test timeout scenarios
  - [ ] Test invalid session scenarios
  - [ ] Verify no false logouts

- [ ] **Test Suite 7**: Production Environment
  - [ ] Deploy to staging
  - [ ] Monitor for 48+ hours
  - [ ] Collect metrics
  - [ ] Verify stability

### Phase 4: Monitoring & Documentation (Ongoing)

- [ ] Set up error tracking (Sentry, etc.)
- [ ] Add analytics for logout events
- [ ] Document auth flow
- [ ] Create runbook for auth issues
- [ ] Set up alerts for unusual logout patterns

---

## PART 6: TESTING & VALIDATION PLAN

### Test Scenarios

#### Scenario 1: Long Active Session
**Objective:** Verify user stays logged in during extended active use

**Steps:**
1. Log in to admin panel
2. Actively use panel for 2+ hours
3. Monitor for unexpected logouts
4. Verify token refreshes work
5. Check role checks don't cause issues

**Success Criteria:**
- No unexpected logouts
- Token refreshes successfully
- Role checks don't interrupt workflow

#### Scenario 2: Idle Session
**Objective:** Verify session persists during idle periods

**Steps:**
1. Log in to admin panel
2. Leave tab open, idle for 30+ minutes
3. Return and use panel
4. Verify still logged in

**Success Criteria:**
- Session persists during idle
- Token refresh works after idle
- No logout on return

#### Scenario 3: Page Reload
**Objective:** Verify session persists across reloads

**Steps:**
1. Log in to admin panel
2. Perform normal refresh (F5)
3. Perform hard refresh (Ctrl+F5)
4. Close and reopen tab
5. Verify session persists

**Success Criteria:**
- Session persists across all reload types
- Role cache restores correctly
- No logout on reload

#### Scenario 4: Multiple Tabs
**Objective:** Verify multiple tabs work correctly

**Steps:**
1. Open admin panel in 2+ tabs
2. Use panel in one tab
3. Refresh one tab
4. Logout in one tab
5. Verify behavior in other tabs

**Success Criteria:**
- Tabs don't interfere with each other
- Logout in one tab logs out others
- Refresh doesn't affect other tabs

#### Scenario 5: Token Expiration
**Objective:** Verify token expiration is handled gracefully

**Steps:**
1. Log in to admin panel
2. Wait for access token expiration (or simulate)
3. Verify auto-refresh works
4. Test refresh failure scenario
5. Verify graceful handling

**Success Criteria:**
- Auto-refresh works seamlessly
- Refresh failures handled gracefully
- No unexpected logouts

#### Scenario 6: Network Failures
**Objective:** Verify network issues don't cause false logouts

**Steps:**
1. Log in to admin panel
2. Simulate network failure (dev tools → Network → Offline)
3. Try to use panel
4. Restore network
5. Verify still logged in

**Success Criteria:**
- Network failures don't cause logout
- Role checks retry on network restore
- Session persists through network issues

#### Scenario 7: Database Errors
**Objective:** Verify DB errors don't cause false logouts

**Steps:**
1. Log in to admin panel
2. Simulate DB unavailability (if possible)
3. Trigger role check
4. Verify behavior
5. Restore DB
6. Verify still logged in

**Success Criteria:**
- DB errors don't cause logout
- Role checks retry on DB restore
- Session persists through DB issues

---

## PART 7: MONITORING & METRICS

### Key Metrics to Track

1. **Logout Frequency**
   - Total logouts per day
   - Unexpected vs expected logouts
   - Logout rate by user

2. **Session Duration**
   - Average session length
   - Longest sessions
   - Sessions ending prematurely

3. **Token Refresh Success Rate**
   - Successful refreshes
   - Failed refreshes
   - Refresh timing

4. **Role Check Performance**
   - Role check duration
   - Role check failures
   - Role check retries

5. **Error Rates**
   - Network errors
   - DB errors
   - Timeout errors
   - Auth errors

### Alerting Thresholds

- **Critical:** > 5 unexpected logouts per hour
- **Warning:** > 10% token refresh failure rate
- **Warning:** > 20% role check failure rate
- **Info:** Session duration < 15 minutes (might indicate issues)

---

## PART 8: ROLLBACK PLAN

### If Fixes Cause Issues

1. **Immediate Rollback:**
   - Revert to previous commit
   - Deploy previous version
   - Monitor for stability

2. **Partial Rollback:**
   - Disable specific fixes
   - Keep working fixes
   - Investigate problematic fixes

3. **Investigation:**
   - Review error logs
   - Identify root cause
   - Plan revised fix

### Rollback Triggers

- Unexpected logout rate increases
- Security vulnerabilities discovered
- Performance degradation
- User complaints increase

---

## PART 9: DOCUMENTATION REQUIREMENTS

### Code Documentation

- [ ] Document auth flow in code comments
- [ ] Document error handling strategy
- [ ] Document retry logic
- [ ] Document cache behavior

### User Documentation

- [ ] Update admin guide with session behavior
- [ ] Document expected session duration
- [ ] Document logout scenarios

### Operations Documentation

- [ ] Create runbook for auth issues
- [ ] Document monitoring setup
- [ ] Document alerting procedures
- [ ] Document rollback procedures

---

## PART 10: CONCLUSION

### Summary

The investigation reveals **critical issues** in the authentication flow that cause unexpected logouts:

1. **Primary Issue:** Role check failures immediately log users out, even for transient errors
2. **Secondary Issue:** Token refresh events trigger unnecessary role re-checks
3. **Tertiary Issue:** No distinction between auth failures and role fetch failures

### Recommended Action Plan

1. **Immediate (Week 1):** Implement Priority 1 fixes (1.1, 1.2, 1.3)
2. **Short-term (Week 2):** Implement Priority 2 fixes (2.1, 2.2, 2.3)
3. **Ongoing:** Monitor, test, and iterate

### Expected Outcomes

After implementing fixes:
- ✅ Users stay logged in during normal usage
- ✅ Network/DB errors don't cause false logouts
- ✅ Token refresh works seamlessly
- ✅ Session persists across page reloads
- ✅ Better error handling and user experience
- ✅ Maintained or improved security

### Risk Assessment

**Implementation Risk:** LOW
- Fixes are focused on error handling, not core auth logic
- Security is maintained or improved
- Changes are isolated and testable

**Rollback Risk:** LOW
- Changes are reversible
- Can deploy incrementally
- Can disable features if needed

---

## APPENDIX A: CODE EXAMPLES (Reference Only)

### Example: Improved checkRole Function

```typescript
const checkRole = async (userId: string, forceRefresh = false) => {
  // Check cache first
  const cached = rolesCache.get(userId);
  if (!forceRefresh && cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    setIsAdmin(cached.isAdmin);
    setIsEditor(cached.isEditor);
    return;
  }

  // Retry logic with exponential backoff
  let lastError: Error | null = null;
  const maxRetries = 3;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      const result = await withTimeout(
        Promise.resolve(queryPromise),
        15000, // Increased timeout
        'Role check'
      );
      
      const { data, error } = result;
      
      if (error) {
        // Distinguish error types
        if (error.code === 'PGRST116' || error.message.includes('JWT')) {
          // Auth error - clear roles
          setIsAdmin(false);
          setIsEditor(false);
          return;
        }
        
        // Transient error - retry
        lastError = error;
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
          continue;
        }
      }
      
      if (data) {
        const isAdminRole = data.some(r => r.role === 'admin') ?? false;
        const isEditorRole = data.some(r => r.role === 'admin' || r.role === 'editor') ?? false;
        
        // Update cache
        rolesCache.set(userId, { 
          isAdmin: isAdminRole, 
          isEditor: isEditorRole, 
          timestamp: Date.now() 
        });
        
        setIsAdmin(isAdminRole);
        setIsEditor(isEditorRole);
        return; // Success
      }
    } catch (err) {
      lastError = err as Error;
      
      // Check if it's a timeout or network error
      if (err instanceof Error && (
        err.message.includes('timeout') || 
        err.message.includes('network') ||
        err.message.includes('fetch')
      )) {
        // Transient error - retry
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
          continue;
        }
      } else {
        // Non-retryable error - preserve last known state
        console.error('Non-retryable error in checkRole:', err);
        // Don't clear roles - preserve last known good state
        return;
      }
    }
  }
  
  // All retries failed - preserve last known state if available
  if (cached) {
    console.warn('Role check failed after retries, using cached values');
    setIsAdmin(cached.isAdmin);
    setIsEditor(cached.isEditor);
  } else {
    console.error('Role check failed and no cache available:', lastError);
    // Only clear if we have no cached value
    setIsAdmin(false);
    setIsEditor(false);
  }
};
```

### Example: Improved onAuthStateChange Handler

```typescript
supabase.auth.onAuthStateChange(async (event, session) => {
  if (!isMounted) return;
  
  console.log('Auth state change:', event, session?.user?.id);
  
  // Handle token refresh separately - don't re-check roles
  if (event === 'TOKEN_REFRESHED') {
    setSession(session);
    setUser(session?.user ?? null);
    // Keep existing role state - don't re-check
    setLoading(false);
    return;
  }
  
  // Handle sign out
  if (event === 'SIGNED_OUT' || !session) {
    setSession(null);
    setUser(null);
    setIsAdmin(false);
    setIsEditor(false);
    setLoading(false);
    return;
  }
  
  // Handle sign in or other events
  setSession(session);
  setUser(session?.user ?? null);
  
  if (session?.user) {
    // Only re-check roles on SIGNED_IN, not on every event
    if (event === 'SIGNED_IN') {
      await checkRole(session.user.id, true); // Force refresh on sign in
    }
    // For other events, keep existing role state
  }
  
  setLoading(false);
});
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-24  
**Status:** Ready for Implementation
