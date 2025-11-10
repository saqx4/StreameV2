# ⚡ QUICK FIX - Watchlist & Favorites Buttons

## 🚨 MOST IMPORTANT: Open Browser Console!

**Press F12 right now!**

Then click the "Add to Watchlist" button and **READ WHAT IT SAYS**.

---

## 📋 3-Step Fix

### Step 1: Run Database Setup (REQUIRED!)

1. Go to https://app.supabase.com
2. Open your project
3. Click "SQL Editor" (left sidebar)
4. Click "New Query"
5. Open `supabase-setup.sql` file
6. Copy EVERYTHING from that file
7. Paste into Supabase SQL Editor
8. Click "Run" (or press Ctrl+Enter)
9. Wait for "Success" message

### Step 2: Make Sure You're Logged In

1. Click "Sign In" or "Sign Up" in the app
2. Create an account or log in
3. You should see your email in the top right

### Step 3: Test with Console Open

1. Press **F12** to open console
2. Click "Console" tab
3. Click "Add to Watchlist" on any movie
4. **READ THE LOGS** - they tell you exactly what's happening

---

## 🎯 What You'll See in Console

### ✅ WORKING (Good!):
```
🎬 Watchlist button clicked!
Current user: {uid: "abc123", email: "you@email.com"}
✅ Added to watchlist
```
**If you see this**: It's working! Check your Profile page.

### ⚠️ NOT LOGGED IN:
```
🎬 Watchlist button clicked!
Current user: null
⚠️ No user logged in
```
**Fix**: Sign in first!

### ❌ DATABASE NOT SETUP:
```
❌ Error: relation "public.users" does not exist
```
**Fix**: Run `supabase-setup.sql` (Step 1 above)

### ❌ PERMISSION ERROR:
```
❌ Error: new row violates row-level security policy
```
**Fix**: Run `supabase-setup.sql` again

---

## 🔧 Nuclear Option (If Nothing Works)

```bash
# 1. Stop dev server (Ctrl+C)

# 2. Clear everything
npm install

# 3. Check .env file exists with:
VITE_TMDB_API_KEY=your_key
VITE_SUPABASE_URL=your_url
VITE_SUPABASE_ANON_KEY=your_key

# 4. Start fresh
npm run dev

# 5. Run supabase-setup.sql in Supabase

# 6. Sign in to the app

# 7. Press F12 and try button
```

---

## 📞 Tell Me What You See

Open console (F12), click the button, and copy-paste what you see!

The logs will tell us exactly what's wrong.

---

**The buttons ARE programmed. They WILL work once the database is set up and you're logged in. The console will tell you what's missing!**
