# Vercel Blob Storage Setup Guide

## Why Vercel Blob?

Vercel's serverless functions have a **read-only file system** - you cannot write files to disk in production. This means file uploads (logo, favicon, media) need cloud storage.

**Vercel Blob** is the easiest solution because:
- ✅ Integrated directly with your Vercel project
- ✅ No separate account needed
- ✅ Generous free tier (5GB storage, 100GB bandwidth/month)
- ✅ Automatic CDN distribution
- ✅ No configuration needed (auto-adds env variables)

---

## Setup Steps

### 1. Enable Vercel Blob Storage

1. Go to your Vercel dashboard
2. Select your project (`ges-five`)
3. Click **Storage** tab in the sidebar
4. Click **Create Database**
5. Select **Blob**
6. Click **Create**

That's it! Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your environment variables.

---

### 2. Verify Environment Variable

Go to **Settings → Environment Variables** and confirm you see:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

If it's not there:
- Go back to **Storage** tab
- Click your Blob store
- Copy the **Read-Write Token**
- Manually add it to Environment Variables

---

### 3. Redeploy

After enabling Blob storage, Vercel will automatically redeploy. If not:

```bash
# Trigger manual deployment
git push origin main
```

Or click **Redeploy** in the Vercel dashboard.

---

## What's Been Updated

The following routes now use Vercel Blob instead of local filesystem:

### Logo/Favicon Upload
- `src/app/api/v1/admin/upload/route.ts` ✅

### Media Library
- `src/app/api/v1/admin/media/route.ts` ✅
- `src/app/api/v1/admin/media/[id]/route.ts` ✅

---

## Testing File Uploads

After deployment:

1. **Login to Admin Panel**
   - Go to `https://ges-five.vercel.app/auth`
   - Login: `admin@greenenergysolutions.in` / `admin123`

2. **Test Logo Upload**
   - Go to `Admin → Settings → Appearance`
   - Upload a logo or favicon
   - Should see success message

3. **Test Media Upload**
   - Go to `Admin → Media`
   - Upload an image
   - Should appear in the media library

4. **Verify in Blob Storage**
   - Go to Vercel dashboard → Storage → Blob
   - You should see your uploaded files listed

---

## Blob Storage Pricing (Free Tier)

- **Storage**: 5 GB
- **Bandwidth**: 100 GB/month
- **Requests**: Unlimited

For a small e-commerce site, this is more than enough!

---

## Local Development

For local development, you can:

**Option 1**: Use Vercel Blob locally (recommended)
```bash
# Your .env.local should have
BLOB_READ_WRITE_TOKEN=your_token_from_vercel
```

**Option 2**: Fallback to filesystem
- If `BLOB_READ_WRITE_TOKEN` is not set, uploads will fail on Vercel
- We could add a fallback for local dev, but using Blob locally is cleaner

---

## Troubleshooting

### "Authentication required" error
- Make sure you're logged in as admin
- Check that JWT token is valid

### "Upload failed" error
- Verify `BLOB_READ_WRITE_TOKEN` exists in environment variables
- Check Vercel deployment logs for details

### Files not appearing
- Check Vercel dashboard → Storage → Blob to see if files are there
- Verify the URL returned from upload API

### "Read-only file system" error
- This means Blob token is missing
- Go to Storage tab and create Blob store

---

## Next Steps

After file uploads work:

1. ✅ Test logo upload in Admin Settings
2. ✅ Test media upload in Media Library
3. ✅ Verify files appear in Vercel Blob dashboard
4. ✅ Test that uploaded images display correctly on site
5. ✅ Test file deletion (should remove from Blob)

---

## Important Notes

- **No changes needed to your code** - already updated
- **No manual configuration** - Vercel auto-configures
- **CDN distribution** - Files are automatically served via CDN
- **URLs are permanent** - Blob URLs don't change unless you delete the file

---

## Support

If you have issues:
1. Check Vercel deployment logs
2. Verify Blob storage is enabled
3. Confirm environment variables are set
4. Test locally with the same token

🚀 **Ready to deploy!**
