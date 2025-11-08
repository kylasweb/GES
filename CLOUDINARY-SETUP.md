# Cloudinary Setup Guide

## Why Cloudinary?

Vercel's serverless functions have a **read-only file system** - you cannot write files to disk in production. This means file uploads (logo, favicon, media) need cloud storage.

**Cloudinary** is an excellent solution because:
- ✅ Generous free tier (25GB storage, 25GB bandwidth/month)
- ✅ Automatic image optimization and transformations
- ✅ Global CDN distribution for fast delivery
- ✅ Easy integration with Node.js
- ✅ Already have API Secret: `tiVK1iy8JpkJolsBwx-kAXXSOHU`

---

## Setup Steps

### 1. Get Your Cloudinary Credentials

You already have the **API Secret**: `tiVK1iy8JpkJolsBwx-kAXXSOHU`

Now get the other two credentials:

1. Go to: https://console.cloudinary.com/
2. Login to your account
3. Go to **Settings** → **Access Keys** (or **API Keys**)
4. You'll see three values:
   - **Cloud Name**: (e.g., `dxxxxx` or `your-company-name`)
   - **API Key**: (e.g., `123456789012345`)
   - **API Secret**: `tiVK1iy8JpkJolsBwx-kAXXSOHU` ✅ (already have this)

---

### 2. Add to Vercel Environment Variables

Go to Vercel Dashboard:

1. Select your project (`ges-five`)
2. Go to **Settings** → **Environment Variables**
3. Add these three variables:

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=tiVK1iy8JpkJolsBwx-kAXXSOHU
```

4. Click **Save**
5. Vercel will automatically redeploy

---

### 3. Update Your Local .env

For local development, add to your `.env` file:

```bash
CLOUDINARY_CLOUD_NAME="your_cloud_name_here"
CLOUDINARY_API_KEY="your_api_key_here"
CLOUDINARY_API_SECRET="tiVK1iy8JpkJolsBwx-kAXXSOHU"
```

---

## What's Been Updated

All file upload routes now use Cloudinary:

### Logo/Favicon Upload
- ✅ `src/app/api/v1/admin/upload/route.ts`
- Uploads to: `ges/logos/` and `ges/favicons/`

### Media Library
- ✅ `src/app/api/v1/admin/media/route.ts`
- ✅ `src/app/api/v1/admin/media/[id]/route.ts`
- Uploads to: `ges/media/{folder}/`
- Thumbnails to: `ges/media/thumbnails/`

### Cloudinary Helper
- ✅ `src/lib/cloudinary.ts`
- Functions: `uploadToCloudinary()`, `deleteFromCloudinary()`, `getPublicIdFromUrl()`

---

## Testing File Uploads

After deployment with Cloudinary credentials:

### 1. Test Logo Upload
1. Go to `https://ges-five.vercel.app/auth`
2. Login: `admin@greenenergysolutions.in` / `admin123`
3. Go to **Admin → Settings → Appearance**
4. Upload a logo or favicon
5. Should see success message
6. Check Cloudinary dashboard - file should appear in `ges/logos/` or `ges/favicons/`

### 2. Test Media Upload
1. Go to **Admin → Media**
2. Click **Upload Files**
3. Select an image
4. Should appear in media library
5. Check Cloudinary dashboard - file in `ges/media/general/`

### 3. Verify in Cloudinary Dashboard
- Go to https://console.cloudinary.com/
- Click **Media Library**
- You should see `ges/` folder with your uploads

---

## Cloudinary Free Tier Limits

- **Storage**: 25 GB
- **Bandwidth**: 25 GB/month
- **Transformations**: 25 credits/month
- **Images/Videos**: Unlimited

Perfect for small to medium e-commerce sites!

---

## How Files Are Organized

```
ges/
├── logos/
│   └── logo_1699999999999.png
├── favicons/
│   └── favicon_1699999999999.ico
└── media/
    ├── general/
    │   └── 1699999999999_abc123.jpg
    ├── products/
    │   └── 1699999999999_def456.jpg
    └── thumbnails/
        └── thumb_1699999999999_abc123.jpg
```

---

## Benefits Over Vercel Blob

| Feature | Cloudinary | Vercel Blob |
|---------|-----------|-------------|
| **Free Storage** | 25 GB | 5 GB |
| **Free Bandwidth** | 25 GB/month | 100 GB/month |
| **Image Optimization** | ✅ Automatic | ❌ Manual |
| **Transformations** | ✅ On-the-fly | ❌ None |
| **CDN** | ✅ Global | ✅ Global |
| **Video Support** | ✅ Yes | ✅ Yes |
| **Pricing after free** | Pay as you go | Pay as you go |

---

## Troubleshooting

### "Upload failed" error
- ✅ Verify all 3 Cloudinary env variables are set in Vercel
- ✅ Check that credentials are correct (copy-paste from Cloudinary dashboard)
- ✅ Make sure you're logged in as admin

### Files not appearing in Cloudinary
- ✅ Check Vercel deployment logs for errors
- ✅ Verify API Secret matches exactly
- ✅ Try uploading directly in Cloudinary dashboard to test credentials

### "Invalid credentials" error
- ✅ Double-check Cloud Name (no spaces, lowercase)
- ✅ API Key should be all numbers
- ✅ API Secret: `tiVK1iy8JpkJolsBwx-kAXXSOHU`

---

## Next Steps

1. ✅ Get Cloud Name and API Key from Cloudinary dashboard
2. ✅ Add all 3 credentials to Vercel environment variables
3. ✅ Wait for Vercel to redeploy (~2-3 minutes)
4. ✅ Test logo upload in Admin Settings
5. ✅ Test media upload in Media Library
6. ✅ Verify files appear in Cloudinary dashboard

---

## Support

If you need help:
- Cloudinary Docs: https://cloudinary.com/documentation
- Cloudinary Support: https://support.cloudinary.com/

🚀 **Ready to upload!**
