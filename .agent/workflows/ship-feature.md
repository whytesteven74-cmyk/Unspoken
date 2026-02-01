---
description: Standard workflow for shipping feature updates (Test -> Commit -> Deploy -> Verify)
---

# 🚀 Ship Feature Workflow

This workflow ensures code quality and deployment stability before marking a task as complete.

## 1. 🧪 Pre-Flight Checks (Testing)
Run type checks and the build process to catch compilation errors.
```bash
# Verify TypeScript types
npx tsc --noEmit

# Verify Build (Next.js)
npm run build
```

## 2. 💾 Database Sync (If Schema Changed)
If `prisma/schema.prisma` was modified, push changes to the database.
```bash
# Push schema to dev DB
npx prisma db push

# Generate client
npx prisma generate
```

## 3. 📦 Commit Changes
Stage and commit the changes to version control.
```bash
git add .
git commit -m "feat: [Feature Name] - [Brief Description]"
```

## 4. 🚀 Deploy
Deploy the application to production (Vercel).
```bash
# Deploy to Production
// turbo
npx vercel --prod
```

## 5. 🔍 Post-Deployment Verification
1.  Visit the live URL.
2.  Navigate to the new feature path (e.g., `/account`).
3.  Verify critical flows (e.g., "Can I see the UserFacts?", "Does the page load without error?").

## 6. ✅ Finalize
- Update `task.md` marking items as complete.
- Notify the team/user.
