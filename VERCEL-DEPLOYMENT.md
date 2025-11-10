# Vercel Deployment Guide

## 🔧 Fix Deployment Issues

### Step 1: Update Vercel Configuration

The `vercel.json` has been updated to use the modern Vercel configuration for Vite projects.

### Step 2: Add Environment Variables in Vercel

**CRITICAL**: You must add these environment variables in your Vercel project settings:

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your **Streame** project
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

#### Required Environment Variables:

```
VITE_TMDB_API_KEY=your_tmdb_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Optional Environment Variables:

```
VITE_APP_NAME=Streame
VITE_APP_VERSION=2.0.0
NODE_ENV=production
```

### Step 3: Redeploy

After adding environment variables:

1. Go to **Deployments** tab in Vercel
2. Click on the latest deployment
3. Click **Redeploy** (or push a new commit)

## 🐛 Common Deployment Issues

### Issue 1: Build Fails with "Missing Environment Variables"

**Error**: `Supabase configuration is missing`

**Solution**: 
- Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel environment variables
- Make sure they're set for **Production**, **Preview**, and **Development** environments

### Issue 2: Build Fails with TypeScript Errors

**Error**: TypeScript compilation errors

**Solution**:
- Check the build logs in Vercel
- Make sure all TypeScript errors are fixed locally first
- Run `npm run build` locally to test

### Issue 3: Build Succeeds but App Doesn't Work

**Error**: App loads but features don't work

**Solution**:
- Check browser console for errors
- Verify all environment variables are set correctly
- Check that Supabase database is set up (run `supabase-setup.sql`)

## 📋 Quick Checklist

- [ ] Environment variables added in Vercel
- [ ] `vercel.json` updated (already done)
- [ ] Code pushed to GitHub
- [ ] Vercel project connected to GitHub repository
- [ ] Deployment triggered (automatic on push)

## 🔍 Verify Deployment

1. Check Vercel deployment logs
2. Visit your deployed site: `streame-flame.vercel.app`
3. Test authentication
4. Test watchlist/favorites functionality
5. Check browser console for errors

## 📝 Notes

- Vercel auto-detects Vite projects, but explicit configuration helps
- Environment variables must start with `VITE_` to be available in the browser
- Never commit `.env` files - they're in `.gitignore`
- Always add environment variables in Vercel dashboard, not in code

---

**After adding environment variables, the deployment should succeed!**

