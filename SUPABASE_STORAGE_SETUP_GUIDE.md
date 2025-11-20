# Supabase Storage Setup Guide - UI Method

## Problem: RLS Policies Blocking Uploads

You're getting "new row violates row-level security policy" because the storage buckets have security policies that block anonymous uploads.

## Solution: Configure Buckets via Supabase Dashboard

Since you can't run the SQL policies directly (permission error), use the Supabase Dashboard:

### Step 1: Access Storage Settings

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** → **Buckets**
3. You should see your buckets: `player-documents` and `player-photos`

### Step 2: Configure Each Bucket

For **both buckets** (`player-documents` and `player-photos`):

1. **Click the bucket name** to open settings
2. **Look for "Public bucket" toggle** - turn this **ON**
3. **Or look for "RLS Policies"** section and click **"New Policy"**

### Step 3A: Make Buckets Public (Easiest)

If you see a **"Public bucket"** toggle:
- ✅ **Turn it ON** for both buckets
- This allows anonymous uploads and reads

### Step 3B: Create RLS Policies (If Public Toggle Not Available)

If you need to create policies manually:

1. **Click "New Policy"** in the bucket settings
2. **Choose "Custom Policy"**
3. **Add these policies for each bucket:**

#### For Upload Permission:
```
Policy Name: Allow anonymous uploads
Operation: INSERT
Target Roles: public (anon)
Policy Definition: true
```

#### For Read Permission:
```
Policy Name: Allow anonymous reads  
Operation: SELECT
Target Roles: public (anon)
Policy Definition: true
```

### Step 4: Test the Configuration

After making changes, run this test:
```bash
cd "c:\AA\X@\New folder\jt3-app"
node -r dotenv/config test-storage-policies.mjs
```

**Expected result after setup:**
```
✅ Upload SUCCESS! Path: documents/test_xxx.png
✅ Upload SUCCESS! Path: selfies/test_xxx.png
```

### Step 5: Verify Your App

After successful setup:
1. **Restart your development server**
2. **Try uploading files in your app**
3. **Console warnings should disappear**
4. **Files should upload directly to Supabase storage**

## Alternative: Keep Using Fallback System

If you prefer not to configure storage (recommended for development):

- ✅ **Your current system works perfectly**
- ✅ **No setup required**
- ✅ **Just ignore the console warnings** - they're informational only
- ✅ **Files are embedded as data URLs** which works great for development

## Troubleshooting

### Can't Find Public Toggle?
- Look for **"RLS Policies"** section instead
- Create the policies manually as shown above

### Still Getting Errors?
- Check that you're logged into Supabase with **owner/admin** permissions
- Try refreshing the dashboard and retrying
- Ensure you're modifying the correct project

### Policies Created But Still Failing?
- Wait 1-2 minutes for changes to propagate
- Clear browser cache and retry
- Check if buckets are now listed as "Public" in the dashboard

## Current Status Check

Run this to see your current setup:
```bash
node -r dotenv/config test-storage-policies.mjs
```

- ❌ **RLS errors** = Buckets need configuration
- ✅ **Upload success** = Configuration complete!
- 🔄 **Fallback working** = Current system is fine, no changes needed