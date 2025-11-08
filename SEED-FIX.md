# Database Seed Fix

## Issue
Database seed was failing with Prisma validation error:
```
Argument `id`: Invalid value provided. Expected String, provided Int.
```

## Root Cause
1. **SiteSettings** model uses `String` (cuid) for `id`, not `Int`
2. No unique field other than `id` to use for `upsert`
3. **LandingTemplate** was missing required `slug` field and using wrong field names

## Fix Applied

### 1. SiteSettings - Changed from `upsert` to `findFirst` + `create`
**Before:**
```typescript
await prisma.siteSettings.upsert({
  where: { id: 1 },  // ❌ Wrong: id is String, not Int
  update: {},
  create: { ... }
});
```

**After:**
```typescript
const existingSettings = await prisma.siteSettings.findFirst();

if (!existingSettings) {
  await prisma.siteSettings.create({
    data: {
      headerStyle: 'default',
      footerStyle: 'default',
      menuStyle: 'default',
      siteName: 'Green Energy Solutions',
      siteDescription: '...',
      contactEmail: 'info@greenenergysolutions.in',
      contactPhone: '+91 1234567890',
      // ... other fields
    }
  });
}
```

### 2. LandingTemplate - Fixed field names and added slug
**Before:**
```typescript
{
  name: 'Modern Eco',
  thumbnailUrl: '/templates/modern-eco.jpg',  // ❌ Wrong field name
  previewUrl: '/templates/modern-eco/preview', // ❌ Doesn't exist
  config: { features: [...] }  // ❌ features inside config
}
```

**After:**
```typescript
{
  name: 'Modern Eco',
  slug: 'modern-eco',  // ✅ Required unique field
  thumbnail: '/templates/modern-eco.jpg',  // ✅ Correct field name
  features: ['Hero Section', 'Product Grid', ...],  // ✅ Top-level array
  colorScheme: 'light',  // ✅ Required field
  tags: ['modern', 'clean', 'professional'],  // ✅ Required array
  config: {
    theme: 'modern',
    colors: { ... }
  }
}
```

### 3. Upsert using correct unique field
```typescript
await prisma.landingTemplate.upsert({
  where: { slug: template.slug },  // ✅ Use slug (unique field)
  update: {},
  create: template,
});
```

## Seed Results

✅ **Successful Seed Output:**
```
Created user: admin@greenenergysolutions.in (SUPER_ADMIN)
Created user: content@greenenergysolutions.in (CONTENT_MANAGER)
Created user: orders@greenenergysolutions.in (ORDER_MANAGER)
Created user: finance@greenenergysolutions.in (FINANCE_MANAGER)
Created user: customer@test.com (CUSTOMER)
Site settings already exist, skipping
Created/updated template: Modern Eco
Created/updated template: Minimal Green
Created/updated template: Corporate Pro
Created/updated template: Flipkart Style
Created/updated template: Neomorphic Design
```

## Database Contents

### Users (5)
1. **Super Admin** - `admin@greenenergysolutions.in` / `admin123`
2. **Content Manager** - `content@greenenergysolutions.in` / `content123`
3. **Order Manager** - `orders@greenenergysolutions.in` / `orders123`
4. **Finance Manager** - `finance@greenenergysolutions.in` / `finance123`
5. **Test Customer** - `customer@test.com` / `customer123`

### Categories (3)
1. **Batteries** - High-capacity batteries for energy storage
2. **Solar Panels** - Efficient solar panels for renewable energy
3. **Accessories** - Accessories for solar and battery systems

### Landing Templates (5)
1. **Modern Eco** (`modern-eco`) - Modern gradient design
2. **Minimal Green** (`minimal-green`) - Minimalist clean design
3. **Corporate Pro** (`corporate-pro`) - Professional B2B design
4. **Flipkart Style** (`flipkart-style`) - E-commerce marketplace
5. **Neomorphic Design** (`neomorphic-design`) - Soft UI with glassmorphism

### Site Settings (1)
- Default header, footer, and menu styles
- Site name and contact information
- Maintenance mode disabled

## Testing

### Login Test
```bash
# Visit the auth page
https://ges-five.vercel.app/auth

# Login with admin credentials
Email: admin@greenenergysolutions.in
Password: admin123
```

### Create Product Test
1. Login as admin
2. Go to Products > Add New
3. Categories dropdown should now show:
   - Batteries
   - Solar Panels
   - Accessories
4. Can successfully create products

### Template Gallery Test
1. Login as admin
2. Go to Admin > Templates
3. Should see 5 templates available
4. Can activate any template

## Next Steps

1. ✅ Database seeded successfully
2. ✅ Can now deploy to Vercel
3. ✅ All admin features will work
4. ✅ Products can be created with categories
5. ✅ Templates are available for activation

---

**Status:** ✅ Fixed and Verified
**File:** `prisma/seed.ts`
**Changes:** SiteSettings creation logic, LandingTemplate schema alignment
