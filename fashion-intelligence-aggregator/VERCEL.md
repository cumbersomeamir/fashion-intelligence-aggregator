# Vercel deployment

This repo is a **monorepo**. The Next.js app is in `frontend/`.

## Required: set Root Directory in Vercel

1. Open your project on [Vercel](https://vercel.com) → **Settings** → **General**.
2. Under **Root Directory**, click **Edit**.
3. Set it to: **`frontend`**
4. Save and redeploy.

If your repo root is the **parent** folder (e.g. you have `fashion-intelligence-aggregator/` as a subfolder), set Root Directory to:

**`fashion-intelligence-aggregator/frontend`**

Vercel will then run `npm install` and `npm run build` inside that directory and deploy the Next.js output. Without this, the build finishes in seconds with no app output and you get **404 NOT FOUND**.
