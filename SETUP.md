# Setup Guide - Streame

## Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (free tier works)
- TMDB API key

## Step 1: Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your environment variables in `.env`:
   ```env
   # TMDB API Configuration
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   
   # Supabase Configuration
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # App Configuration
   VITE_APP_NAME=Streame
   VITE_APP_VERSION=2.1.0
   
   # Development Settings
   NODE_ENV=development
   
   # Feature Flags
   VITE_ENABLE_ANALYTICS=false
   VITE_ENABLE_NOTIFICATIONS=true
   ```

## Step 2: Get TMDB API Key

1. Go to [TMDB](https://www.themoviedb.org/)
2. Create a free account
3. Go to Settings → API
4. Request an API key (choose "Developer" option)
5. Copy your API key to `.env` file

## Step 3: Setup Supabase

### Create Supabase Project

1. Go to [Supabase](https://supabase.com/)
2. Create a new project
3. Wait for the project to be ready
4. Go to Project Settings → API
5. Copy your project URL and anon/public key to `.env` file

### Setup Database

1. Go to SQL Editor in your Supabase dashboard
2. Create a new query
3. Copy and paste the contents of `supabase-setup.sql`
4. Run the query
5. Verify the `users` table was created successfully

### Verify Setup

Run this query in SQL Editor to verify:
```sql
SELECT * FROM public.users LIMIT 1;
```

## Step 4: Install Dependencies

```bash
npm install
```

## Step 5: Run Development Server

```bash
npm run dev
```

The app should now be running at `http://localhost:5173`

## Step 6: Test Watchlist & Favorites

1. Create an account or sign in
2. Browse to any movie or TV show
3. Click "Add to Watchlist" button
4. Click the heart icon to add to favorites
5. Go to your Profile page to see your lists

### Troubleshooting Watchlist/Favorites

If buttons don't work:

1. **Check browser console** for errors:
   - Press F12 to open DevTools
   - Look for red error messages
   - Check Network tab for failed requests

2. **Verify Supabase connection**:
   - Make sure `.env` has correct Supabase credentials
   - Check if `users` table exists in Supabase
   - Verify Row Level Security policies are active

3. **Check authentication**:
   - Make sure you're logged in
   - Try logging out and back in
   - Clear browser cache and cookies

4. **Database issues**:
   - Run `supabase-setup.sql` again
   - Check Supabase logs for errors
   - Verify your user ID exists in auth.users

5. **Common errors and fixes**:

   **Error**: "User not authenticated"
   - **Fix**: Log out and log back in

   **Error**: "Permission denied"
   - **Fix**: Re-run `supabase-setup.sql` to fix RLS policies

   **Error**: "Table doesn't exist"
   - **Fix**: Run `supabase-setup.sql` in Supabase SQL Editor

   **Error**: "Network error"
   - **Fix**: Check your internet connection and Supabase URL

## Step 7: Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## Step 8: Deploy

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com/)
3. Import your repository
4. Add environment variables in Vercel dashboard
5. Deploy!

### Environment Variables for Vercel

Add these in Vercel Project Settings → Environment Variables:

- `VITE_TMDB_API_KEY`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME`
- `VITE_APP_VERSION`
- `NODE_ENV` (set to `production`)

## Testing

### Test Watchlist Functionality

1. Sign in to your account
2. Open browser DevTools (F12)
3. Go to Console tab
4. Navigate to a movie page
5. Click "Add to Watchlist"
6. You should see console logs:
   ```
   Adding to watchlist: <user-id> <media-item>
   Updating watchlist with: [...]
   Successfully added to watchlist
   ```
7. Check your Profile page - the movie should appear in Watchlist

### Test Favorites Functionality

1. While on a movie page
2. Click the heart icon
3. Check console for:
   ```
   Adding to favorites: <user-id> <media-item>
   Updating favorites with: [...]
   Successfully added to favorites
   ```
4. Check your Profile page - the movie should appear in Favorites

## Common Issues

### Issue: Blank page on load
**Solution**: Check that `.env` file exists and has all required variables

### Issue: "API key is missing" error
**Solution**: Add TMDB API key to `.env` file

### Issue: Can't sign in
**Solution**: 
1. Check Supabase URL and keys in `.env`
2. Verify Supabase project is active
3. Check browser console for errors

### Issue: Buttons don't respond
**Solution**:
1. Check if you're logged in
2. Open browser console to see errors
3. Verify Supabase database is set up correctly
4. Re-run `supabase-setup.sql`

## Performance Tips

1. **Enable browser caching** for better load times
2. **Use modern browsers** (Chrome, Firefox, Edge, Safari)
3. **Clear cache** if experiencing issues
4. **Disable browser extensions** that might interfere

## Security

- Never commit `.env` file to Git
- Keep your API keys secret
- Use environment variables for all sensitive data
- Enable Row Level Security in Supabase
- Regularly update dependencies

## Support

If you encounter issues:

1. Check browser console for errors
2. Review Supabase logs
3. Verify environment variables
4. Check network requests in DevTools
5. Review `SECURITY.md` and `PERFORMANCE.md`

## License

SPDX-License-Identifier: MIT
Copyright (c) 2025 SnoozeScript
