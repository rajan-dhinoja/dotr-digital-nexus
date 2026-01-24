# Authentication Logout Issue - Quick Reference

## 🚨 Critical Issues Identified

### Issue #1: Role Check Failures Cause Immediate Logout (CRITICAL)
**Location:** `src/contexts/AuthContext.tsx:89-90`

**Problem:**
- When `checkRole()` encounters ANY error (network timeout, DB error, etc.), it sets `isEditor = false`
- `ProtectedRoute` immediately redirects to login when `isEditor` is false
- **Result:** Any temporary error = immediate logout

**Fix Priority:** P0 - Implement immediately

---

### Issue #2: Token Refresh Triggers Unnecessary Role Re-Check (HIGH)
**Location:** `src/contexts/AuthContext.tsx:129-144`

**Problem:**
- `onAuthStateChange` fires for ALL auth events, including `TOKEN_REFRESHED`
- Every token refresh (every ~1 hour) triggers a role re-check
- If role check fails during refresh → logout

**Fix Priority:** P0 - Implement immediately

---

### Issue #3: No Distinction Between Auth Failure and Role Fetch Failure (HIGH)
**Location:** `src/contexts/AuthContext.tsx:72-76, 87-91`

**Problem:**
- Network errors, DB errors, and auth errors all treated the same
- All cause immediate logout
- Should preserve role state on transient errors

**Fix Priority:** P0 - Implement immediately

---

## 📋 Immediate Action Items

### Week 1: Critical Fixes

1. **Fix `checkRole` error handling**
   - Preserve `isEditor` state on transient errors
   - Only clear roles on explicit auth failures
   - Add retry logic with exponential backoff

2. **Filter `onAuthStateChange` events**
   - Handle `TOKEN_REFRESHED` separately (don't re-check roles)
   - Only re-check roles on `SIGNED_IN` events
   - Preserve role state during token refresh

3. **Improve `ProtectedRoute`**
   - Add retry mechanism before redirecting
   - Distinguish between "loading" and "unauthorized"
   - Show error message before redirect

---

## 🔍 Investigation Checklist

### Phase 1: Verify Current Behavior
- [ ] Monitor `onAuthStateChange` events in console
- [ ] Check localStorage for session persistence
- [ ] Test role check with network throttling
- [ ] Monitor token refresh timing

### Phase 2: Test Scenarios
- [ ] Long active session (2+ hours)
- [ ] Page reload behavior
- [ ] Network failure scenarios
- [ ] Multiple tabs open
- [ ] Token expiration edge cases

---

## 🛠️ Implementation Priority

### P0 - Critical (Do First)
1. Fix `checkRole` to preserve state on errors
2. Filter `onAuthStateChange` events properly
3. Add retry logic to `ProtectedRoute`

### P1 - Important (Do Next)
1. Persist role cache in localStorage
2. Increase timeout values
3. Add comprehensive logging

### P2 - Nice to Have
1. Session health monitoring
2. Offline support
3. Better loading states

---

## 🔒 Security Impact

**All fixes maintain or improve security:**
- ✅ No security weakening
- ✅ Better error handling (doesn't compromise security)
- ✅ Maintains role validation
- ✅ Preserves session security

---

## 📊 Expected Outcomes

After fixes:
- ✅ Users stay logged in during normal usage
- ✅ Network/DB errors don't cause false logouts
- ✅ Token refresh works seamlessly
- ✅ Session persists across page reloads
- ✅ Better UX without compromising security

---

## 📖 Full Documentation

See `AUTH_LOGOUT_INVESTIGATION_PLAN.md` for:
- Complete investigation plan
- Detailed root cause analysis
- Full implementation checklist
- Testing scenarios
- Code examples

---

**Status:** Ready for Implementation  
**Estimated Fix Time:** 1-2 weeks  
**Risk Level:** Low (changes are isolated and reversible)
