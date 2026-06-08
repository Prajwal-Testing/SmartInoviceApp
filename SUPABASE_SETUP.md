# Supabase Setup Guide - Step by Step with Screenshots

## Overview
This guide walks you through creating a Supabase project and configuring it for SmartInvoice in 15 minutes.

---

## Step 1: Create Supabase Account (2 minutes)

### 1.1 Visit Supabase
- Go to **https://supabase.com**
- Click **"Sign Up"** (top right)
- Choose: **Sign up with GitHub** OR **Sign up with Google**

### 1.2 Authorize & Confirm Email
- Approve GitHub/Google authorization
- Check your email for confirmation link
- Click confirmation link
- Dashboard loads automatically

---

## Step 2: Create Your First Project (5 minutes)

### 2.1 New Project
- Dashboard shows "**Welcome!**" screen
- Click **"New Project"** button

### 2.2 Fill Project Details
Fill the form with:

| Field | Value |
|-------|-------|
| **Organization** | Create new: `smartinvoice-org` |
| **Project Name** | `smartinvoice` |
| **Database Password** | Strong password (e.g., `Pwd@123SmartInv456!`) |
| **Region** | Singapore (nearest to India) OR Mumbai (if available) |
| **Pricing Plan** | FREE (✓ selected) |

**⚠️ Important**: Save your database password somewhere safe!

### 2.3 Create Project
- Click **"Create new project"**
- Wait 2 minutes... (shows loading animation)
- ✅ Project loads automatically

---

## Step 3: Get Your API Credentials (2 minutes)

### 3.1 Navigate to API Settings
1. Left sidebar → **"Settings"** icon
2. Click **"API"** in the menu
3. You'll see two tabs: **Project API keys** and **Service Role**

### 3.2 Copy Your Credentials
On the **"Project API keys"** tab, find:

**Copy these two values:**

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Save them temporarily** in a text file (notepad/docs).

### ✅ Example (DO NOT USE):
```
URL: https://xyzabc123def456.supabase.co
KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc3d0bHpmd20iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMjAwMDAwMCwiZXhwIjoxOTI3NjAwMDAwfQ.tR_rjgV8aPCPkEXS4K6xHr5zxB_q0K4aQ0m1j4-K3Ks
```

---

## Step 4: Create Database Tables (3 minutes)

### 4.1 Open SQL Editor
1. Left sidebar → **"SQL Editor"** 
2. Click **"New Query"**
3. Editor opens (empty text box)

### 4.2 Copy Database Schema
The database schema is in: `supabase/migrations/20260608074237_*.sql`

**Inside your project, open file:**
```
supabase/migrations/20260608074237_275b51a8-4c74-4bc4-ba23-18434860e272.sql
```

**Copy ALL content** (entire SQL file)

### 4.3 Paste & Execute
1. Paste entire SQL content into the editor
2. Click **"Run"** button (bottom right)
3. Wait for green checkmark ✅
4. You should see: "Executed successfully"

### 4.4 Verify Tables
1. Left sidebar → **"Table Editor"**
2. You should see 5 new tables:
   - ✅ `customers`
   - ✅ `products`
   - ✅ `packages`
   - ✅ `custom_pricing`
   - ✅ `invoices`

**If any table is missing**, re-run the SQL from Step 4.3.

---

## Step 5: Update Your App with Credentials (2 minutes)

### 5.1 Create .env.local
In your project root folder, create new file: `.env.local`

**File content:**
```
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_PUBLIC_KEY
```

### 5.2 Replace Values
1. Replace `YOUR_PROJECT_ID` with your project ID
2. Replace `YOUR_ANON_PUBLIC_KEY` with the key from Step 3.2

**Example:**
```
VITE_SUPABASE_URL=https://xyzabc123.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc3d0bHpmd20iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYyMjAwMDAwMCwiZXhwIjoxOTI3NjAwMDAwfQ.tR_rjgV8aPCPkEXS4K6xHr5zxB_q0K4aQ0m1j4-K3Ks
```

### ⚠️ Important
- **DO NOT** share this file
- **DO NOT** commit to GitHub
- It's listed in `.gitignore` (protected)

---

## Step 6: Verify Connection (1 minute)

### 6.1 Start Local App
```bash
npm install
npm run dev
```

App opens at: `http://localhost:5173`

### 6.2 Test Connection
1. Go to **"Customers"** page
2. Click **"Add Customer"**
3. Fill form:
   - Name: `Test Shop`
   - Shop Name: `Test Shop Ltd`
   - Phone: `9999999999`
   - GST: `27AABCT1234H1Z0`
   - Address: `Mumbai, India`
4. Click **"Add Customer"**

### 6.3 Check Supabase
1. Go back to Supabase Dashboard
2. Left sidebar → **"Table Editor"**
3. Select **"customers"** table
4. You should see your test customer! ✅

**If test customer appears in Supabase = Connection successful! 🎉**

---

## Step 7: Setup Complete! ✅

### You Now Have:
- ✅ Supabase project running
- ✅ 5 database tables with data
- ✅ API credentials configured
- ✅ Local app connected to database
- ✅ Ready for deployment

### Next Steps:
1. **Continue testing** on `http://localhost:5173`
2. **Try all features**:
   - Add customers
   - Add products + packages
   - Create invoices
   - Print as PDF
3. **Deploy to Vercel** when ready (see DEPLOYMENT_CHECKLIST.md)

---

## 🚨 Troubleshooting

### Issue: SQL Migration Failed
**Solution:**
1. Check if syntax is correct (SQL is case-sensitive)
2. Try running in smaller chunks
3. Go to Table Editor → manually create tables
4. Contact Supabase support (Discord/Docs)

### Issue: Can't See Tables in Table Editor
**Solution:**
1. Refresh page (Ctrl+R)
2. Go back to SQL Editor → verify "Executed successfully"
3. Wait 10 seconds (sometimes it takes time)
4. Clear browser cache (Ctrl+Shift+Del)

### Issue: App Can't Connect to Database
**Solution:**
1. Check `.env.local` file exists
2. Verify URL format: `https://xxxxx.supabase.co`
3. Check anon key is correct (no spaces)
4. Restart app: Stop dev server + run `npm run dev` again
5. Check browser console (F12) for error messages

### Issue: "Error: Invalid API Key"
**Solution:**
1. Go to Supabase Dashboard
2. Settings → API → Copy key again (fresh copy)
3. Update `.env.local` with new key
4. Restart dev server

---

## 🔒 Security Notes

### ✅ This is Safe
- Anon public key is meant to be public
- Supabase RLS policies protect data
- Your Supabase project is secured with password
- Free tier has DDoS protection

### ⚠️ Never Share
- Database password
- Service role key (never use in frontend)
- Private information in invoices
- Database connection strings

---

## 📊 Database Schema Explained

### customers table
Stores customer information for invoicing
```
id (UUID) - Unique identifier
name - Customer name
shop_name - Business name
phone - Contact number
gst - GST registration number
address - Business address
created_at - Auto-timestamp
```

### products table
Different products (e.g., Sanitizer, Disinfectant)
```
id (UUID) - Unique identifier
product_name - Product name
created_at - Auto-timestamp
```

### packages table
Package sizes for each product (e.g., 1L, 5L, 10L)
```
id (UUID) - Unique identifier
product_id - Link to product
package - Size/variant name
price - Unit price
stock - Current stock quantity
created_at - Auto-timestamp
```

### invoices table
Complete invoice records
```
id (UUID) - Unique identifier
invoice_no - Invoice number (INV-0001, etc)
customer_id - Link to customer
customer_snapshot - Customer data at time of invoice
date - Invoice date
items (JSON) - Line items array
subtotal - Sum without GST
gst_enabled - Whether GST applied
gst_rate - GST percentage (18%, 5%, etc)
gst_amount - GST amount
total - Final amount
created_at - Auto-timestamp
```

### custom_pricing table
Special pricing for specific customer+package combinations
```
id (UUID) - Unique identifier
customer_id - Link to customer
package_id - Link to package
custom_price - Override price for this customer
```

---

## 🎯 You're Ready!

Now you can:
1. ✅ Manage customers
2. ✅ Manage products & packages
3. ✅ Create professional GST invoices
4. ✅ Track inventory (stock)
5. ✅ Set custom pricing per customer
6. ✅ Print/download invoices as PDF

**Next: Deploy to Vercel** → See `DEPLOYMENT_CHECKLIST.md`

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.io
- Check browser console (F12) for detailed errors

**Built by Prajwal Kedari** ✨
