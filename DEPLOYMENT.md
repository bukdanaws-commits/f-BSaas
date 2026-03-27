# Eventify - SaaS Event Management Platform

## Deployment Guide

### Repository
https://github.com/bukdanaws-commits/f-BSaas

### Architecture
- **Frontend**: Next.js 16 → Vercel (eventku.co.id)
- **Backend**: Golang Fiber → Render.com (fnb.eventku.co.id)
- **Database**: Supabase PostgreSQL

---

## 1. Deploy Golang Backend to Render.com

### Step 1: Create New Web Service
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository: `bukdanaws-commits/f-BSaas`
4. Select the repository

### Step 2: Configure Service
- **Name**: `eventify-api`
- **Region**: Singapore
- **Branch**: master
- **Root Directory**: `backend`
- **Runtime**: Docker
- **Plan**: Starter (Free) or Standard

### Step 3: Set Environment Variables

| Key | Value |
|-----|-------|
| `SERVER_PORT` | `8080` |
| `APP_ENV` | `production` |
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.ibrdwbsfwrrxeqglpppk.supabase.co:5432/postgres` |
| `JWT_SECRET` | `[Generate a strong secret]` |
| `GOOGLE_CLIENT_ID` | `[From Google Cloud Console]` |
| `GOOGLE_CLIENT_SECRET` | `[From Google Cloud Console]` |
| `SUPABASE_URL` | `https://ibrdwbsfwrrxeqglpppk.supabase.co` |
| `SUPABASE_ANON_KEY` | `[From Supabase Dashboard]` |
| `SUPABASE_SERVICE_KEY` | `[From Supabase Dashboard]` |
| `MIDTRANS_MERCHANT_ID` | `[From Midtrans Dashboard]` |
| `MIDTRANS_SERVER_KEY` | `[From Midtrans Dashboard]` |
| `MIDTRANS_CLIENT_KEY` | `[From Midtrans Dashboard]` |
| `MIDTRANS_IS_SANDBOX` | `true` |
| `FRONTEND_URL` | `https://eventku.co.id` |

### Step 4: Deploy
Click "Create Web Service" and wait for deployment.

### Step 5: Configure Custom Domain
1. Go to your service settings
2. Add custom domain: `fnb.eventku.co.id`
3. Configure DNS CNAME record pointing to your Render service

---

## 2. Deploy Frontend to Vercel

### Step 1: Import Project
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" → "Project"
3. Import `bukdanaws-commits/f-BSaas` repository

### Step 2: Configure Project
- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `npm run build`
- **Output Directory**: `.next`

### Step 3: Set Environment Variables

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://fnb.eventku.co.id/api` |
| `NEXTAUTH_SECRET` | `[Generate a strong secret]` |
| `NEXTAUTH_URL` | `https://eventku.co.id` |
| `GOOGLE_CLIENT_ID` | `[From Google Cloud Console]` |
| `GOOGLE_CLIENT_SECRET` | `[From Google Cloud Console]` |

### Step 4: Deploy
Click "Deploy" and wait for deployment.

### Step 5: Configure Custom Domain
1. Go to your project settings
2. Add domain: `eventku.co.id`
3. Configure DNS records as instructed by Vercel

---

## 3. Google OAuth Setup

### Step 1: Go to Google Cloud Console
https://console.cloud.google.com/apis/credentials

### Step 2: Create OAuth 2.0 Client ID
1. Click "Create Credentials" → "OAuth client ID"
2. Application type: "Web application"
3. Name: "Eventify"

### Step 3: Configure Authorized URLs
**Authorized JavaScript origins:**
- `https://eventku.co.id`
- `https://fnb.eventku.co.id`
- `http://localhost:3000` (for development)

**Authorized redirect URIs:**
- `https://eventku.co.id/auth/callback`
- `http://localhost:3000/auth/callback`

### Step 4: Get Credentials
- Copy Client ID and Client Secret
- Add to Render and Vercel environment variables

---

## 4. Post-Deployment Checklist

### Verify Backend Health
```bash
curl https://fnb.eventku.co.id/health
```
Expected response:
```json
{
  "status": "ok",
  "message": "Eventify API is running",
  "version": "1.0.0"
}
```

### Verify Frontend
1. Visit `https://eventku.co.id`
2. Check API connection status on login page
3. Test Google OAuth login

### Test Google OAuth
1. Click "Continue with Google" button
2. Select your Google account
3. Verify successful login and redirect to dashboard

---

## 5. Environment Variables Summary

### Backend (Render.com)
```
SERVER_PORT=8080
APP_ENV=production
DATABASE_URL=postgresql://postgres:PASSWORD@db.ibrdwbsfwrrxeqglpppk.supabase.co:5432/postgres
JWT_SECRET=<generate-strong-secret>
GOOGLE_CLIENT_ID=<from-google-cloud>
GOOGLE_CLIENT_SECRET=<from-google-cloud>
SUPABASE_URL=https://ibrdwbsfwrrxeqglpppk.supabase.co
SUPABASE_ANON_KEY=<from-supabase>
SUPABASE_SERVICE_KEY=<from-supabase>
MIDTRANS_MERCHANT_ID=<from-midtrans>
MIDTRANS_SERVER_KEY=<from-midtrans>
MIDTRANS_CLIENT_KEY=<from-midtrans>
MIDTRANS_IS_SANDBOX=true
FRONTEND_URL=https://eventku.co.id
```

### Frontend (Vercel)
```
NEXT_PUBLIC_API_URL=https://fnb.eventku.co.id/api
NEXTAUTH_SECRET=<generate-strong-secret>
NEXTAUTH_URL=https://eventku.co.id
GOOGLE_CLIENT_ID=<from-google-cloud>
GOOGLE_CLIENT_SECRET=<from-google-cloud>
```

---

## Support

For issues or questions, contact:
- GitHub: https://github.com/bukdanaws-commits/f-BSaas/issues
- Website: https://goopps.id
