# Production Login Test

## Test the deployed authentication on Vercel

Visit: https://ges-five.vercel.app/auth

## Quick Test Steps:

### 1. Super Admin Login
1. Click the "Super Admin" quick login card
2. **Expected**: Should redirect to https://ges-five.vercel.app/admin
3. **If fails**: Open browser console (F12) and share the logs

### 2. Manual Login
1. Enter email: `admin@greenenergysolutions.in`
2. Enter password: `admin123`
3. Click "Sign In"
4. **Expected**: Should redirect to https://ges-five.vercel.app/admin

## Console Logs You Should See:

```
[Auth] Login attempt for: admin@greenenergysolutions.in
[Auth] Login response status: 200
[Auth] Login successful: {user: {...}, token: '...'}
Login successful, user: {...}
Redirecting to: /admin (or /dashboard)
```

## Common Issues:

### Issue: Page just reloads
- **Cause**: Old deployment still active
- **Fix**: Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)

### Issue: 401 on initial load
- **This is NORMAL** - not logged in yet, expected behavior
- Ignore this error, just try logging in

### Issue: Login button does nothing
- Check browser console for errors
- Make sure JavaScript is enabled

## If Login Still Doesn't Work:

1. **Check Vercel deployment status**: https://vercel.com/dashboard
2. **Verify environment variables are set**
3. **Check Vercel function logs** for errors
4. **Try incognito/private window** to rule out cache issues

## Success Criteria:

✅ Can click quick login card
✅ Redirects to /admin or /dashboard
✅ Can see user info/dashboard content
✅ No redirect loops
✅ Cookie persists across page refreshes
