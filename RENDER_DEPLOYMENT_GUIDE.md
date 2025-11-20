# Render Deployment Guide for Jamii Tourney Backend

## Step 1: Create Render Account
1. Go to https://render.com
2. Sign up with GitHub (recommended) or email

## Step 2: Deploy the Backend

### Option A: Deploy from GitHub (Recommended)
1. **Push your code to GitHub** (if not already):
   ```powershell
   git add .
   git commit -m "Add Render deployment config"
   git push
   ```

2. **In Render Dashboard**:
   - Click **"New +"** → **"Web Service"**
   - Connect your GitHub account
   - Select your repository: `jt3-app`
   - Click **"Connect"**

3. **Configure Service**:
   - **Name**: `jamii-tourney-backend` (or your choice)
   - **Region**: Choose closest to Kenya (e.g., Frankfurt, Singapore)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: Leave empty
   - **Runtime**: **Node**
   - **Build Command**: `npm install`
   - **Start Command**: `node server/working-server.mjs`

4. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   VITE_SUPABASE_URL=https://siolrhalqvpzerthdluq.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGc...
   DATABASE_URL=postgresql://postgres.siolrhalqvpzerthdluq:Dewanz12332121@...
   SESSION_SECRET=your-super-secret-session-key-here
   NODE_ENV=production
   ```
   ⚠️ **Copy from your .env file**

5. **Deploy**:
   - Click **"Create Web Service"**
   - Wait 2-5 minutes for deployment
   - You'll get a URL like: `https://jamii-tourney-backend.onrender.com`

### Option B: Manual Deploy (Without GitHub)
1. In Render Dashboard: **"New +"** → **"Web Service"**
2. Select **"Deploy from a public Git repository"**
3. Enter your repo URL
4. Follow steps 3-5 from Option A

## Step 3: Verify Backend is Running

Once deployed, test the health endpoint:
```powershell
curl https://jamii-tourney-backend.onrender.com/api/health
```

Should return: `{"status":"healthy","timestamp":"..."}`

## Step 4: Update Frontend to Use Render Backend

1. **In Netlify Dashboard**:
   - Go to your site: jamiisportske.netlify.app
   - Click **"Site configuration"** → **"Environment variables"**
   - Click **"Add a variable"**
   - Key: `VITE_API_URL`
   - Value: `https://jamii-tourney-backend.onrender.com` (your Render URL)
   - Click **"Save"**

2. **Redeploy Frontend**:
   ```powershell
   # Trigger redeploy from terminal
   netlify deploy --prod
   ```

3. **Test Production Site**:
   - Open https://jamiisportske.netlify.app
   - Try signing up as tournament admin
   - Check browser console (F12) - no 404 errors!

## Step 5: Test Complete Workflow

1. **User Signup**:
   - Go to https://jamiisportske.netlify.app/auth/signup
   - Fill in details and select a tournament
   - Should redirect to pending approval page

2. **Super Admin Login**:
   - Go to https://jamiisportske.netlify.app/auth/login
   - Login as super admin
   - Navigate to Admin → Admin Requests tab
   - Should see the request

3. **Approve Request**:
   - Click "Approve" on the request
   - User should now be able to login as tournament admin

## Important Notes

### Free Tier Limitations
- **Render Free Tier**: Service spins down after 15 minutes of inactivity
- **First Request**: May take 30-60 seconds to wake up (cold start)
- **Solution**: Upgrade to paid plan ($7/month) for always-on service

### CORS Configuration
The backend already includes CORS for:
- `http://localhost:5173-5177` (development)
- You may need to add production URL if CORS errors occur

### Monitoring
- **Render Dashboard**: View logs, metrics, deployments
- **Health Check**: Render pings `/api/health` every few minutes
- **Logs**: Real-time logs available in Render dashboard

## Troubleshooting

### Backend Returns 404
- Check environment variables are set in Render
- Verify start command: `node server/working-server.mjs`
- Check logs in Render dashboard

### Frontend Still Shows 404
- Verify VITE_API_URL is set in Netlify
- Redeploy frontend after setting variable
- Clear browser cache (Ctrl+Shift+R)

### CORS Errors
Add your production frontend URL to CORS whitelist in `server/working-server.mjs`:
```javascript
const allowedOrigins = [
  'http://localhost:5173',
  'https://jamiisportske.netlify.app',  // Add this
];
```

### Cold Start Delays
- Expected on free tier
- Consider paid plan for production use
- Or use a "keep-alive" service to ping every 10 minutes

## Deployment Complete! 🎉

Your full-stack application is now live:
- **Frontend**: https://jamiisportske.netlify.app
- **Backend**: https://jamii-tourney-backend.onrender.com
- **Database**: Supabase (already configured)

Test the complete tournament admin request workflow!
