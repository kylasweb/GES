# Quick Vercel Setup Checklist

## ⚠️ IMPORTANT: File Upload Fix Required

**File uploads were failing** because Vercel's serverless functions have a read-only filesystem. This has been fixed by implementing **Vercel Blob Storage**.

### What Changed:
- ✅ Installed `@vercel/blob` package
- ✅ Updated upload routes to use cloud storage instead of local filesystem
- ✅ Logo/Favicon uploads now work on Vercel
- ✅ Media library uploads now work on Vercel

**📖 See `BLOB-STORAGE-SETUP.md` for detailed setup instructions**

---

## ✅ Minimum Required Environment Variables

Copy these to your Vercel dashboard (Project → Settings → Environment Variables):

```bash
DATABASE_URL=postgresql://neondb_owner:npg_i67TunNELeYM@ep-billowing-grass-a16ac6k6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=0d706d263e90a7418c1159a406bcb3750960e93980eec4fb477e04105f8b769a6e2c31938c30f108d954039838a6a962b59ef1be6046d9c5fa83a9b99fdeb973

NEXT_PUBLIC_APP_URL=https://ges-five.vercel.app

PHONEPE_MERCHANT_ID=placeholder
PHONEPE_SALT_KEY=placeholder
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=development

NODE_ENV=production

# Vercel Blob Storage (for file uploads)
# This will be automatically created by Vercel when you connect Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxxxxx
```

## Steps:

1. ✅ **Enable Vercel Blob Storage** (for file uploads):
   - Go to Vercel → Your Project → Storage → Create Database
   - Select **Blob** → Create
   - Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to environment variables
   
2. ✅ Copy all variables above
3. ✅ Go to Vercel → Your Project → Settings → Environment Variables
4. ✅ Add each variable (Name and Value)
5. ✅ Click "Save"
6. ✅ Vercel will auto-redeploy
7. ✅ Wait for deployment to complete (~2-3 minutes)
8. ✅ Run database seed: `npm run db:seed`
9. ✅ Test: Visit `https://ges-five.vercel.app/auth`
10. ✅ Login with: `admin@greenenergysolutions.in` / `admin123`

## Notes:

- **Vercel Blob**: Required for file uploads (logo, favicon, media). Enable in Storage tab before deploying.
- **PhonePe**: Using placeholder values - will be configured by client admin later
- **JWT_SECRET**: Already generated for production (different from local)
- **DATABASE_URL**: Your Neon PostgreSQL database
- **NEXT_PUBLIC_APP_URL**: Update if you use a custom domain

## Test After Deployment:

```
https://ges-five.vercel.app/api/health  ← Should show success
https://ges-five.vercel.app/auth        ← Login page
https://ges-five.vercel.app/admin       ← Admin panel (after login)
```

That's it! 🚀
