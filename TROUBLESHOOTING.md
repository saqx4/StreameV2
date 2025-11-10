# Troubleshooting Guide - Watchlist & Favorites Not Working

## 🔍 How to Debug the Issue

### Step 1: Open Browser Console

1. **Open Developer Tools**:
   - Windows/Linux: Press `F12` or `Ctrl + Shift + I`
   - Mac: Press `Cmd + Option + I`

2. **Go to Console Tab**:
   - Click on the "Console" tab at the top
   - Clear any existing logs (click the 🚫 icon)

### Step 2: Test the Buttons

1. **Navigate to any movie or TV show**
2. **Click "Add to Watchlist" button**
3. **Watch the console** - You should see:

```
🎬 Watchlist button clicked!
Current user: {uid: "...", email: "..."}
Movie: {id: "...", title: "..."}
Is in watchlist: false
🔄 Starting watchlist toggle...
➕ Adding to watchlist
Item to add: {id: 123, title: "...", type: "movie", ...}
Adding to watchlist: user-id {id: 123, ...}
Updating watchlist with: [...]
Successfully added to watchlist
✅ Added to watchlist
```

4. **Click the heart icon (Like button)**
5. **Watch the console** - You should see similar logs for favorites

## ❌ Common Errors and Solutions

### Error 1: "No user logged in, showing auth modal"

**What you see in console**:
```
🎬 Watchlist button clicked!
Current user: null
⚠️ No user logged in, showing auth modal
```

**Solution**:
1. You're not logged in
2. Click "Sign In" or "Sign Up"
3. Create an account or log in
4. Try the button again

---

### Error 2: "User not authenticated"

**What you see in console**:
```
❌ Error toggling watchlist: Error: User not authenticated
```

**Solution**:
1. Log out completely
2. Clear browser cache and cookies
3. Log back in
4. Try again

---

### Error 3: No console logs appear at all

**Symptoms**:
- You click the button
- Nothing happens in console
- No logs appear

**Possible Causes**:
1. **JavaScript is disabled** in your browser
2. **Console is filtering logs** - Check filter settings
3. **Page didn't load properly** - Refresh the page

**Solution**:
1. Refresh the page (F5 or Ctrl+R)
2. Check console filter (should be set to "All levels")
3. Try in a different browser
4. Check if JavaScript is enabled

---

### Error 4: "Table doesn't exist" or "relation does not exist"

**What you see in console**:
```
Supabase error: {code: "42P01", message: "relation \"public.users\" does not exist"}
```

**Solution**:
1. **Run the database setup script**:
   - Go to your Supabase dashboard
   - Click on "SQL Editor"
   - Click "New Query"
   - Copy and paste the entire contents of `supabase-setup.sql`
   - Click "Run"
   - Wait for success message

2. **Verify table was created**:
   ```sql
   SELECT * FROM public.users LIMIT 1;
   ```

---

### Error 5: "Permission denied" or "new row violates row-level security policy"

**What you see in console**:
```
Supabase error: {code: "42501", message: "new row violates row-level security policy"}
```

**Solution**:
1. **Re-run the database setup** to fix RLS policies:
   - Go to Supabase SQL Editor
   - Run `supabase-setup.sql` again

2. **Check if user exists in auth.users**:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   ```

3. **Manually create user row** if needed:
   ```sql
   INSERT INTO public.users (id, watchlist, favorites, created_at, updated_at)
   VALUES (
     'your-user-id-from-auth-users',
     '[]'::jsonb,
     '[]'::jsonb,
     NOW(),
     NOW()
   );
   ```

---

### Error 6: "Item already in watchlist" but button doesn't change

**What you see in console**:
```
Item already in watchlist
```

**Symptoms**:
- Button still says "Add to Watchlist"
- Item is already added but UI doesn't reflect it

**Solution**:
1. **Refresh the page** - The real-time subscription should update
2. **Check Profile page** - Item should be there
3. **Clear browser cache**
4. **Log out and log back in**

---

### Error 7: Network errors or timeout

**What you see in console**:
```
Failed to fetch
NetworkError
AbortError: The operation was aborted
```

**Solution**:
1. **Check internet connection**
2. **Verify Supabase URL** in `.env` file
3. **Check Supabase project status** (might be paused)
4. **Try again in a few minutes**

---

### Error 8: "Cannot read properties of undefined"

**What you see in console**:
```
Cannot read properties of undefined (reading 'uid')
Cannot read properties of null (reading 'title')
```

**Solution**:
1. **Wait for data to load** - Movie/TV show data might still be loading
2. **Check if movie exists** - Try a different movie
3. **Refresh the page**

---

## 🧪 Manual Testing Steps

### Test 1: Verify Button Click Works

1. Open console
2. Click "Add to Watchlist"
3. **Expected**: You should see `🎬 Watchlist button clicked!`
4. **If not**: Button click handler is not attached - rebuild the app

### Test 2: Verify User is Logged In

1. Open console
2. Type: `localStorage.getItem('supabase.auth.token')`
3. **Expected**: You should see a token string
4. **If null**: You're not logged in

### Test 3: Verify Supabase Connection

1. Open console
2. Click watchlist button
3. **Expected**: You should see "Adding to watchlist: ..."
4. **If error**: Check Supabase credentials in `.env`

### Test 4: Verify Database Table Exists

1. Go to Supabase dashboard
2. Click "Table Editor"
3. Look for "users" table
4. **Expected**: Table should exist with columns: id, watchlist, favorites, created_at, updated_at
5. **If not**: Run `supabase-setup.sql`

### Test 5: Verify Real-time Updates

1. Add item to watchlist
2. Open Profile page in another tab
3. **Expected**: Item should appear immediately
4. **If not**: Real-time subscriptions might not be working

---

## 🔧 Quick Fixes

### Fix 1: Rebuild the Application

```bash
# Stop the dev server (Ctrl+C)
npm install
npm run dev
```

### Fix 2: Clear All Cache

```bash
# In browser console
localStorage.clear()
sessionStorage.clear()
# Then refresh page (F5)
```

### Fix 3: Reset Supabase Database

```sql
-- In Supabase SQL Editor
DROP TABLE IF EXISTS public.users CASCADE;
-- Then run supabase-setup.sql again
```

### Fix 4: Create User Row Manually

```sql
-- Get your user ID first
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- Create user row (replace 'your-user-id' with actual ID)
INSERT INTO public.users (id, watchlist, favorites, created_at, updated_at)
VALUES (
  'your-user-id',
  '[]'::jsonb,
  '[]'::jsonb,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;
```

---

## 📋 Checklist Before Asking for Help

- [ ] Opened browser console (F12)
- [ ] Clicked the button and checked console logs
- [ ] Verified I'm logged in
- [ ] Ran `supabase-setup.sql` in Supabase
- [ ] Checked `.env` file has correct credentials
- [ ] Tried refreshing the page
- [ ] Tried in a different browser
- [ ] Cleared browser cache
- [ ] Checked Supabase dashboard for errors

---

## 🆘 Still Not Working?

If you've tried everything above and it still doesn't work:

1. **Copy ALL console logs** (right-click in console → Save as...)
2. **Take a screenshot** of the error
3. **Check Supabase logs**:
   - Go to Supabase Dashboard
   - Click "Logs"
   - Look for errors around the time you clicked the button
4. **Provide this information**:
   - Browser and version
   - Operating system
   - Console logs
   - Supabase logs
   - Steps you've already tried

---

## 💡 Pro Tips

1. **Keep console open** while testing - You'll see errors immediately
2. **Use incognito mode** - Eliminates cache/extension issues
3. **Test with simple movie** - Try a popular movie like "The Matrix"
4. **Check Network tab** - See if API calls are being made
5. **Enable verbose logging** - Set `VITE_ENABLE_ANALYTICS=true` in `.env`

---

## 📞 Support

If you need help:
- Check `SETUP.md` for setup instructions
- Check `SECURITY.md` for security issues
- Check `IMPROVEMENTS-SUMMARY.md` for what was fixed
- Open browser console and share the logs

---

**Remember**: The buttons ARE programmed and working. If you see the console logs, the buttons are clicking. The issue is usually with authentication or database setup.
