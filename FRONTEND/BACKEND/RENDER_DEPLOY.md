# QuickBite - Render Deployment Guide

This guide will help you deploy your QuickBite Food Ordering System to [Render.com](https://render.com).

## Prerequisites

- A [Render.com](https://render.com) account
- A GitHub repository with your code
- Java 17 (for local testing)

---

## Quick Deploy Option (Recommended)

### Step 1: Push to GitHub
Make sure your code is pushed to a GitHub repository.

### Step 2: Create a Blueprint on Render
1. Log in to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** and select **"Blueprint"**
3. Connect your GitHub repository
4. Select the `BACKEND/render.yaml` file
5. Click **"Apply"**

Render will automatically:
- Create a MySQL database (`quickbite-db`)
- Build and deploy the Java backend (`quickbite-backend`)

### Step 3: Initialize the Database
After deployment, connect to your Render MySQL database and run the schema:

```bash
# Connect to your Render MySQL database using the credentials from Render dashboard
mysql -h your-host -u your-user -p quickbite_db < BACKEND/database.sql
```

---

## Manual Deploy Option

If you prefer manual deployment:

### Step 1: Create a MySQL Database on Render
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **"New +"** → **"MySQL"**
3. Choose a name: `quickbite-db`
4. Select **Free** plan
5. Click **"Create Database"**

### Step 2: Create a Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `quickbite-backend`
   - **Environment**: `Docker`
   - **Dockerfile Path**: `BACKEND/Dockerfile`
   - **Docker Context**: `.`
4. Add environment variables:
   - `PORT` = `8080`
   - `DB_URL` = (from your MySQL database connection string)
   - `DB_USER` = (from your MySQL database)
   - `DB_PASSWORD` = (from your MySQL database)
5. Click **"Create Web Service"**

### Step 3: Initialize the Database
Run the SQL commands from `database.sql` on your Render MySQL.

---

## Frontend Deployment

You have two options for the frontend:

### Option A: Deploy as Static Site on Render
1. Click **"New +"** → **"Static Site"**
2. Connect your GitHub repository
3. Set:
   - **Build Command**: (leave empty)
   - **Publish Directory**: `FRONTEND`
4. Add environment variable:
   - `API_URL` = `https://quickbite-backend.onrender.com/api`
5. Click **"Create Static Site"**

### Option B: Use as-is (index.html loads locally)
The `FRONTEND/env.js` automatically detects if it's running on Render and connects to the correct backend URL.

---

## Environment Variables

### Backend (Set in Render Dashboard)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | HTTP port (Render sets this) | `8080` |
| `DB_URL` | MySQL connection URL | `mysql://user:pass@host:3306/db` |
| `DB_USER` | Database username | `root` |
| `DB_PASSWORD` | Database password | `your-password` |

### Frontend (if using static site)
| Variable | Description | Example |
|----------|-------------|---------|
| `API_URL` | Backend API URL | `https://quickbite-backend.onrender.com/api` |

---

## Testing Your Deployment

1. **Backend Health Check**: Visit `https://quickbite-backend.onrender.com/api/health`
2. **API Endpoints**:
   - `https://quickbite-backend.onrender.com/api/foods`
   - `https://quickbite-backend.onrender.com/api/orders`
   - `https://quickbite-backend.onrender.com/api/users`

---

## Troubleshooting

### Database Connection Failed
- Make sure your MySQL database is running on Render
- Verify `DB_URL`, `DB_USER`, and `DB_PASSWORD` are correct
- Check that the database schema was imported

### Frontend Can't Connect to Backend
- Ensure CORS is enabled (it is by default in `Server.java`)
- Check that `env.js` has the correct `API_URL`
- Verify the backend is responding at `/api/health`

### Build Fails
- Ensure Java 17 is available in the Docker container
- Check that `lib/mysql-connector-j-9.6.0.jar` exists

---

## Free Tier Limits

Render's free tier has some limitations:
- **Web Service**: Sleeps after 15 minutes of inactivity (takes ~30s to wake up)
- **MySQL**: Free for 90 days, then expires (requires upgrade or recreation)
- **Static Site**: Unlimited for personal projects

For production, consider upgrading to a paid plan.
