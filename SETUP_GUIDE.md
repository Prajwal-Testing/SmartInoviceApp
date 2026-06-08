# SmartInvoice - Complete Setup & Deployment Guide

## 🎯 Quick Overview
- **App Name**: SmartInvoice
- **Backend**: Supabase (Free tier)
- **Frontend**: React + TanStack Start
- **Deployment**: Vercel (Free tier)
- **Database**: PostgreSQL (via Supabase)

---

## 📋 What's Fixed
✅ Line 42 in `src/lib/api.ts` - Fixed TypeScript error with null coalescing operator
✅ All database schemas ready (customers, products, packages, invoices, custom_pricing)
✅ GST invoice formatting with Maruti Chemical branding
✅ Subscription gate system
✅ Stock management & auto-decrement

---

## 🚀 STEP 1: Setup Supabase (FREE)

### 1.1 Create Supabase Account
1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Sign Up"** and create account with GitHub/Google
3. Go to Dashboard

### 1.2 Create Project
1. Click **"New Project"**
2. **Organization**: Create new (or use existing)
3. **Project Name**: `smartinvoice`
4. **Database Password**: Create strong password (save it!)
5. **Region**: Choose nearest to you (e.g., Singapore for India)
6. Click **"Create new project"** (takes ~2 minutes)

### 1.3 Get Your Credentials
Once project loads:
1. Go to **Settings** → **API** (left sidebar)
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key (the "public API key")
3. Save them temporarily

### 1.4 Run Database Migration
1. Go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Copy entire content from `/supabase/migrations/20260608074237_*.sql`
4. Paste into SQL Editor
5. Click **"Run"** 
6. Wait for success message ✅

### 1.5 Verify Tables Created
Go to **Table Editor** → You should see:
- `customers`
- `products`
- `packages`
- `custom_pricing`
- `invoices`

---

## 🔌 STEP 2: Connect Your Local App to Supabase

### 2.1 Create `.env.local` File
In your project root, create file `.env.local`:

```env
# Supabase Credentials (replace with YOUR values)
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

**Where to find:**
- `VITE_SUPABASE_URL`: From Supabase Dashboard → Settings → API → Project URL
- `VITE_SUPABASE_ANON_KEY`: From Supabase Dashboard → Settings → API → "anon" public key

### 2.2 Verify Supabase Client
Check file: `src/integrations/supabase/client.ts`

Should look like:
```typescript
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

---

## 🧪 STEP 3: Test Locally

### 3.1 Install Dependencies
```bash
npm install
# or if using bun:
bun install
```

### 3.2 Run Development Server
```bash
npm run dev
# or
bun run dev
```

App should be at: `http://localhost:5173`

### 3.3 Test Features
1. **Add Customer**: Go to "Customers" → Add a test customer
2. **Add Product**: Go to "Products" → Add a test product
3. **Add Package**: Select product → Add "1L" package with price
4. **Create Invoice**: Go to "Invoices" → New → Test invoice creation
5. **Print**: Click Print button → Save as PDF

All data should be saved to Supabase!

---

## 📦 STEP 4: Deploy to Vercel (FREE)

### 4.1 Push Code to GitHub
1. Create GitHub account if you don't have one: [github.com](https://github.com)
2. Create new repository: `smartinvoice`
3. Push your code:

```bash
git init
git add .
git commit -m "Initial SmartInvoice commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smartinvoice.git
git push -u origin main
```

### 4.2 Connect to Vercel
1. Go to [https://vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Click **"Import Project"**
4. Select your `smartinvoice` repository
5. Project settings should auto-detect:
   - **Framework**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### 4.3 Add Environment Variables
Before clicking "Deploy":

1. Expand **"Environment Variables"** section
2. Add two variables:
   - **Name**: `VITE_SUPABASE_URL`
     **Value**: `https://YOUR_PROJECT_ID.supabase.co`
   
   - **Name**: `VITE_SUPABASE_ANON_KEY`
     **Value**: YOUR_ANON_PUBLIC_KEY

3. Click **"Deploy"** (takes 1-2 minutes)

### 4.4 Your App is Live! 🎉
Once deployment completes:
- Visit your Vercel URL (e.g., `https://smartinvoice-xxx.vercel.app`)
- Start creating invoices!
- Data persists to your Supabase database

---

## 🔐 Security Notes

### ✅ Safe
- Supabase RLS policies enabled (public access for demo)
- No sensitive data in `.env`
- API keys are public (by design) but can't modify data without proper auth

### 🔒 For Production (Optional)
1. Implement Supabase Auth (email/password)
2. Update RLS policies to restrict by `auth.uid()`
3. Add encryption for GST numbers
4. Use Stripe for premium features

---

## 🆘 Troubleshooting

### Build Fails on Vercel
**Error**: `Cannot find module '@supabase/supabase-js'`
- Solution: Run `npm install` locally first, commit `package-lock.json`

### No Data Appears in App
**Error**: Tables empty or not loading
1. Check `.env.local` values (copy-paste exactly)
2. Verify Supabase project is active (not paused)
3. Check table permissions in Supabase
4. Run SQL migration again if needed

### Can't Create Invoices
**Error**: "Failed to create invoice"
1. Ensure at least 1 customer exists
2. Ensure product has packages with prices
3. Check browser console (F12) for error details

### Print/PDF Not Working
**Error**: Blank page or styling missing
1. Open browser DevTools (F12)
2. Go to Print Preview (Ctrl+Shift+P)
3. Check if invoice renders
4. Adjust CSS if needed in `src/components/InvoicePrint.tsx`

---

## 📊 Supabase Free Tier Limits
- **Database**: 500 MB
- **Bandwidth**: 2 GB/month
- **API Requests**: Unlimited
- **Users**: Up to 50,000

Perfect for small Indian businesses!

---

## 🎯 Next Steps After Launch

1. **Add More Products**: Set up your chemical products
2. **Customize Invoice**: Update company name in `src/lib/types.ts`
3. **Add Custom Pricing**: Different rates per customer
4. **Track Reports**: Use dashboard charts for revenue insights
5. **Backup Data**: Weekly exports from Supabase

---

## 📞 Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **React Router Docs**: https://tanstack.com/router/latest
- **Supabase Discord**: https://discord.supabase.io

---

**Built by Prajwal Kedari** ✨
**SmartInvoice - Professional GST Invoicing for Indian Businesses**
