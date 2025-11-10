# Push to StreameV2 Repository

## Step 1: Create the repository on GitHub
1. Go to https://github.com/new
2. Repository name: `StreameV2`
3. Description: `Movie & TV Show Streaming Platform V2`
4. Visibility: Public
5. **Don't** initialize with README, .gitignore, or license
6. Click "Create repository"

## Step 2: Add the new remote and push

After creating the repository, run these commands:

```bash
# Add the new remote (replace YOUR_USERNAME with your GitHub username)
git remote add v2 https://github.com/YOUR_USERNAME/StreameV2.git

# Push the main branch
git push v2 main

# Push the master branch
git push v2 master

# Set main as the default branch for the v2 remote
git push v2 main --set-upstream
```

## Alternative: Replace origin entirely

If you want to make StreameV2 the primary repository:

```bash
# Remove old origin
git remote remove origin

# Add new origin
git remote add origin https://github.com/YOUR_USERNAME/StreameV2.git

# Push all branches
git push origin --all

# Push tags if any
git push origin --tags
```
