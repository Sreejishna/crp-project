# 🚀 Deployment Guide: Cyclic Recruitment Portal (Vercel + MongoDB Atlas)

This guide walks you through deploying your **Cyclic Recruitment Portal (CRP)** to **Vercel** with a free cloud **MongoDB Atlas** database.

---

## 📋 Architecture Overview
- **Frontend:** Vanilla HTML, CSS, & JavaScript served globally via Vercel CDN Edge Network.
- **Backend API:** Express REST API served via Vercel Serverless Function (`/api/index.js`).
- **Database:** MongoDB Atlas (M0 Free Tier Cluster) with connection pooling and auto-seeding.

---

## Step 1: Set Up Free MongoDB Atlas Database

Since Vercel uses ephemeral serverless functions, you need a hosted cloud MongoDB database:

1. Visit [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas) and sign in or create a free account.
2. Click **Create a Deployment** and select the **M0 Free Tier** (AWS / any region closest to you).
3. Under **Security Quickstart**:
   - **Username & Password:** Create a database user (e.g., username `crp_admin` and note down your password).
   - **Network Access:** Choose **Allow Access from Anywhere** (`0.0.0.0/0`) so Vercel serverless functions can connect.
4. Click **Connect** → Choose **Drivers** (Node.js).
5. Copy your connection string. It looks like:
   ```text
   mongodb+srv://crp_admin:<password>@cluster0.abcde.mongodb.net/cyclic_recruitment_portal?retryWrites=true&w=majority
   ```
   *(Replace `<password>` with your database user password, and make sure to include the database name, e.g. `/cyclic_recruitment_portal`)*.

---

## Step 2: Commit and Push Code to GitHub

Open a terminal in your project root (`c:\Users\sreejishna\OneDrive\Desktop\crp pro`):

```bash
# Stage all files (node_modules and .env are automatically ignored)
git add .

# Create initial commit
git commit -m "Configure Vercel deployment with serverless API and cloud database support"

# Rename branch to main
git branch -M main

# Add your GitHub repository remote (replace with your repo URL)
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# Push code to GitHub
git push -u origin main
```

---

## Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and log in with your GitHub account.
2. Click **Add New...** → **Project**.
3. Locate your GitHub repository and click **Import**.
4. In the **Configure Project** screen:
   - **Framework Preset:** Leave as *Other* (detected automatically).
   - **Root Directory:** `./` (default).
5. Expand the **Environment Variables** section and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string from Step 1 |
| `JWT_SECRET` | `crp_portal_super_secret_jwt_key_2026` | Any secret string for signing JWT tokens |
| `NODE_ENV` | `production` | Production mode |

6. Click **Deploy**.

---

## Step 4: Verification & Live URL

Within 1–2 minutes, Vercel will complete the build and assign you a live production URL (e.g., `https://cyclic-recruitment-portal.vercel.app`).

### Automatic Data Seeding
On your first visit, the serverless handler automatically checks if the database is fresh. If empty, it automatically runs the demo data seeder. All 9 companies, cyclic pattern analysis, test students, and demo accounts will be ready immediately!

### Ready-to-Use Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Placement Admin** | `admin@crp.edu` | `admin123` |
| **MCA Coordinator** | `mca.coord@crp.edu` | `dept123` |
| **Student (Final Year MCA)** | `rahul.mca@crp.edu` | `student123` |
| **Student (1st Year CSE)** | `arjun.firstyear@crp.edu` | `student123` |

---

## 🛠️ Project Configuration Files Created

- [`vercel.json`](file:///c:/Users/sreejishna/OneDrive/Desktop/crp%20pro/vercel.json): Routes `/api/*` to serverless function and static assets to `frontend/`.
- [`api/index.js`](file:///c:/Users/sreejishna/OneDrive/Desktop/crp%20pro/api/index.js): Vercel serverless adapter with database connection caching and automatic initial data seeder.
- [`backend/config/db.js`](file:///c:/Users/sreejishna/OneDrive/Desktop/crp%20pro/backend/config/db.js): Handles MongoDB Atlas replica sets, connection reuse, and local fallback.
- [`.gitignore`](file:///c:/Users/sreejishna/OneDrive/Desktop/crp%20pro/.gitignore): Excludes `node_modules`, `.env`, and temporary files from repository commits.
- [`package.json`](file:///c:/Users/sreejishna/OneDrive/Desktop/crp%20pro/package.json): Added missing `jsonwebtoken` dependency for production builds.
