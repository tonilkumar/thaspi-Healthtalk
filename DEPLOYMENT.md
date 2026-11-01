# Deploying HealPath on Vercel (100% Free Hobby Account)

You can deploy HealPath to a **Free Vercel Account** with zero cost.

---

## 3-Step Deployment Guide

### Step 1: Push your code to GitHub
If you haven't already, push this project repository to your GitHub account (public or private repository).

### Step 2: Import into Vercel
1. Log in to [vercel.com](https://vercel.com) (sign up with GitHub if you don't have an account).
2. Click **"Add New..."** → **"Project"**.
3. Select your GitHub repository (`HealPath`) and click **"Import"**.
4. Vercel will automatically detect the settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Your Environment Variables
Under the **Environment Variables** section in Vercel before clicking Deploy:
- **`GEMINI_API_KEY`**: Your Google Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey).
- *(Optional)* **`VITE_SUPABASE_URL`**: Your Supabase project URL (if using external Supabase).
- *(Optional)* **`VITE_SUPABASE_ANON_KEY`**: Your Supabase anon public key.

Click **"Deploy"**!

---

## Why It Works on Free Vercel
- **Frontend SPA**: Built via `vite build` to `dist/`, served globally via Vercel's edge CDN.
- **Serverless API**: The `/api/chat.ts` and `/api/health.ts` endpoints run as Vercel Serverless Functions on the free tier with generous limits (100,000 function invocations/month).
- **SPA Routing**: `vercel.json` ensures that `/` routes fallback to `index.html` while preserving `/api/*` endpoints.
