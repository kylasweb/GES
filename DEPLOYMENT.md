# Vercel Deployment Guide

## Environment Variables Setup

Go to your Vercel dashboard → Project Settings → Environment Variables and add these:

### Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_i67TunNELeYM@ep-billowing-grass-a16ac6k6-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# JWT Secret (GENERATE A NEW ONE FOR PRODUCTION!)
JWT_SECRET=0d706d263e90a7418c1159a406bcb3750960e93980eec4fb477e04105f8b769a6e2c31938c30f108d954039838a6a962b59ef1be6046d9c5fa83a9b99fdeb973

# Application URL (UPDATE WITH YOUR VERCEL URL!)
NEXT_PUBLIC_APP_URL=https://ges-five.vercel.app

# PhonePe Configuration (Optional - can be configured later by client admin)
PHONEPE_MERCHANT_ID=placeholder
PHONEPE_SALT_KEY=placeholder
PHONEPE_SALT_INDEX=1
PHONEPE_ENV=development

# Node Environment
NODE_ENV=production
```

## Important Notes

### 1. JWT Secret
- The JWT_SECRET above is already generated for production
- **DO NOT** use the same secret from your local `.env` file

### 2. Application URL
- Update `NEXT_PUBLIC_APP_URL` with your actual Vercel deployment URL
- Current URL appears to be: `https://ges-five.vercel.app`

### 3. PhonePe Credentials
- **Not required now** - These will be configured later by the client from the admin panel
- Use placeholder values (`placeholder`) for now - the payment gateway will be set up when ready

## Database Setup

After setting environment variables, you need to seed the production database:

### Option 1: Use Vercel CLI (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link your project
vercel link

# Run seed command on Vercel
vercel env pull .env.production
npm run db:seed
```

### Option 2: Connect to Neon Database Directly

```bash
# Use psql or any PostgreSQL client to connect to your Neon database
# Then run the seed script manually using the DATABASE_URL
```

### Option 3: Create Users Manually via SQL

Connect to your Neon database and run:

```sql
-- Insert admin user (password: admin123)
INSERT INTO "User" (id, email, name, password, role, "isActive", "createdAt", "updatedAt")
VALUES (
  'admin1',
  'admin@greenenergysolutions.in',
  'Super Admin',
  '$2b$12$hashed_password_here', -- You'll need to hash the password
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW()
);
```

## Deployment Steps

1. **Set all environment variables in Vercel dashboard**
2. **Redeploy your application** (Vercel will auto-redeploy when you push to main)
3. **Seed the database** (use one of the options above)
4. **Test the deployment**:
   - Visit `https://ges-five.vercel.app/api/health`
   - Visit `https://ges-five.vercel.app/auth`
   - Try logging in with test credentials

## Test Credentials

After seeding the database, these credentials will work:

```
Super Admin:
Email: admin@greenenergysolutions.in
Password: admin123

Content Manager:
Email: content@greenenergysolutions.in
Password: content123

Order Manager:
Email: orders@greenenergysolutions.in
Password: orders123

Finance Manager:
Email: finance@greenenergysolutions.in
Password: finance123

Test Customer:
Email: customer@test.com
Password: customer123
```

## Troubleshooting

### 401 Errors on /api/v1/auth/me
- This means JWT_SECRET is not set or incorrect
- Make sure you've set all environment variables
- Redeploy after setting variables

### 500 Errors
- Check Vercel function logs
- Verify DATABASE_URL is correct
- Ensure database is accessible from Vercel

### Database Connection Issues
- Verify Neon database allows connections from Vercel
- Check if DATABASE_URL includes `?sslmode=require`

## Next Steps

1. Set environment variables ✅
2. Redeploy ✅
3. Seed database ✅
4. Test login ✅
5. Update NEXT_PUBLIC_APP_URL with actual domain (if using custom domain)

## Quick Commands

```bash
# Generate new JWT secret (for production)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Run database seed locally (connects to production DB)
npm run db:seed

# View Vercel logs
vercel logs

# Check environment variables
vercel env ls
```
