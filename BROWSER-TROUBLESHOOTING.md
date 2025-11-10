# Browser Troubleshooting Guide

## Current Status
✅ Works on: Firefox, Mobile browsers, Incognito mode
❌ Issues on: Brave, Edge (normal mode with extensions)

## What We've Fixed
1. ✅ Removed TanStack Router devtools
2. ✅ Relaxed Content Security Policy
3. ✅ Made Supabase optional (won't crash without env vars)
4. ✅ Made TMDB API optional (won't crash without API key)
5. ✅ Added global error handlers
6. ✅ Set build target to ES2015 for better compatibility
7. ✅ Enabled console logging for debugging

## How to Debug in Brave/Edge

### Step 1: Check Console Errors
1. Press `F12` to open Developer Tools
2. Go to **Console** tab
3. Refresh the page
4. Look for red error messages
5. Copy any errors you see

### Step 2: Check Network Tab
1. In Developer Tools, go to **Network** tab
2. Refresh the page
3. Look for failed requests (red status codes)
4. Check if JavaScript files are loading (look for .js files)

### Step 3: Disable Browser Extensions
**In Brave:**
1. Go to `brave://extensions/`
2. Disable all extensions
3. Refresh the site

**In Edge:**
1. Go to `edge://extensions/`
2. Disable all extensions
3. Refresh the site

### Step 4: Disable Brave Shields
1. Click the **Lion icon** in the address bar
2. Turn off **Shields**
3. Refresh the page

### Step 5: Clear Cache
1. Press `Ctrl + Shift + Delete`
2. Select **Cached images and files**
3. Click **Clear data**
4. Refresh the site

## Environment Variables Needed in Vercel

The app will work without these, but features will be limited:

```env
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### How to Add in Vercel:
1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable
5. **Redeploy** the project

## Common Issues

### White Screen After Loading
- **Cause**: Missing environment variables or JavaScript error
- **Solution**: Check console for errors, add env vars in Vercel

### Works in Incognito but Not Normal Mode
- **Cause**: Browser extension or cached data
- **Solution**: Clear cache or disable extensions

### Works on Mobile but Not Desktop
- **Cause**: Desktop browser extensions or strict security settings
- **Solution**: Try incognito mode or disable Brave Shields

## Need More Help?

Check the browser console (F12) and look for:
- ⚠️ Yellow warnings about missing API keys (expected)
- 🔴 Red errors (these need fixing)
- Failed network requests in Network tab
