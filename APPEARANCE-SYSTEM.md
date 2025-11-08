# Appearance Customization System

## Overview
The appearance customization system allows admins to change the site's header and footer styles without touching code. The system includes 13 pre-designed style variants that can be activated with a single click.

## Features

### 🎨 Style Options

#### Headers (5 variants)
1. **Default** - Classic header with logo, navigation, search, cart, and user menu
2. **Minimal** - Compact design with essential elements only
3. **Centered** - Balanced layout with centered logo and navigation
4. **Transparent** - Overlay header that transitions to solid on scroll
5. **Mega Menu** - Full-width dropdown menus with categories and featured items

#### Footers (4 variants)
1. **Default** - Multi-column layout with company info, links, and contact details
2. **Minimal** - Single-row footer with essential links only
3. **Newsletter** - Prominent newsletter signup with gradient background
4. **Social** - Social media focused with large icon buttons

### 🔧 Admin Interface

**Location**: `/admin/appearance` (System > Appearance)

**Features**:
- Visual preview cards for each style
- Active style indicator with green badge
- One-click activation
- Instant updates across the site
- Toast notifications on changes

### 📁 File Structure

```
src/
├── components/
│   └── layout/
│       ├── headers/
│       │   ├── DefaultHeader.tsx
│       │   ├── MinimalHeader.tsx
│       │   ├── CenteredHeader.tsx
│       │   ├── TransparentHeader.tsx
│       │   └── MegaHeader.tsx
│       ├── footers/
│       │   ├── DefaultFooter.tsx
│       │   ├── MinimalFooter.tsx
│       │   ├── NewsletterFooter.tsx
│       │   └── SocialFooter.tsx
│       ├── DynamicHeader.tsx
│       ├── DynamicFooter.tsx
│       ├── responsive-layout.tsx
│       └── index.ts
├── app/
│   ├── admin/
│   │   └── appearance/
│   │       └── page.tsx
│   └── api/
│       └── v1/
│           ├── appearance/
│           │   └── route.ts (Public API)
│           └── admin/
│               └── appearance/
│                   └── route.ts (Admin API)
└── prisma/
    └── schema.prisma (SiteSettings model)
```

### 🗄️ Database Schema

```prisma
model SiteSettings {
  id             Int      @id @default(autoincrement())
  headerStyle    String   @default("default")
  footerStyle    String   @default("default")
  menuStyle      String   @default("default")
  // ... other fields
}
```

### 🔌 API Endpoints

#### Public API
**GET** `/api/v1/appearance`
- Returns current header/footer/menu styles
- Cached for 5 minutes
- No authentication required
- Used by frontend components

#### Admin API
**GET** `/api/v1/admin/appearance`
- Returns full site settings
- Requires admin authentication

**PUT** `/api/v1/admin/appearance`
- Updates header/footer/menu styles
- Validates style values
- Requires admin authentication
- Auto-creates settings if missing
- Clears cache on update

### 🎯 How It Works

1. **Dynamic Components**: `DynamicHeader` and `DynamicFooter` fetch appearance settings on mount
2. **Caching**: Public API caches settings for 5 minutes to reduce DB queries
3. **Revalidation**: Admin updates clear the cache for instant changes
4. **Fallback**: Default styles are used if API fails or settings don't exist

### 🚀 Usage

#### For Users (Admins)
1. Go to **Admin Panel** → **System** → **Appearance**
2. Browse through the available header and footer styles
3. Click **Select** on your preferred style
4. Changes apply instantly site-wide

#### For Developers

**Using Dynamic Components**:
```tsx
import { DynamicHeader, DynamicFooter } from '@/components/layout';

export default function Layout({ children }) {
  return (
    <>
      <DynamicHeader />
      <main>{children}</main>
      <DynamicFooter />
    </>
  );
}
```

**Using Specific Variants**:
```tsx
import { TransparentHeader, NewsletterFooter } from '@/components/layout';

export default function LandingPage() {
  return (
    <>
      <TransparentHeader />
      <main>{/* content */}</main>
      <NewsletterFooter />
    </>
  );
}
```

**ResponsiveLayout (Recommended)**:
```tsx
import { ResponsiveLayout } from '@/components/layout/responsive-layout';

export default function Page() {
  return (
    <ResponsiveLayout>
      {/* Your page content */}
    </ResponsiveLayout>
  );
}
```

### ➕ Adding New Styles

1. **Create Component**:
```tsx
// src/components/layout/headers/CustomHeader.tsx
export function CustomHeader() {
  // Your custom header design
}
```

2. **Add to DynamicHeader**:
```tsx
case 'custom':
  return <CustomHeader />;
```

3. **Update Schema** (if adding new style type):
```prisma
headerStyle String @default("default")
// Valid values: default, minimal, centered, transparent, mega, custom
```

4. **Update Admin UI**:
Add style card to `src/app/admin/appearance/page.tsx`

5. **Update API Validation**:
Add to `validHeaderStyles` array in API route

### 🎨 Style Design Guidelines

**Headers**:
- Height: 14-20px (3.5-5rem)
- Sticky positioning preferred
- Mobile responsive with hamburger menu
- Include logo, navigation, and essential actions

**Footers**:
- Multi-column or single-row layouts
- Include essential links and contact info
- Copyright notice required
- Mobile-friendly stacking

### 📊 Performance

- **First Load**: ~2KB per variant component
- **API Cache**: 5 minutes
- **Database Queries**: Minimal (cached)
- **Build Impact**: Shared chunks optimized

### 🔐 Security

- Admin-only write access
- Public read access (appearance data is not sensitive)
- Input validation on all style changes
- SQL injection prevention via Prisma

### 🧪 Testing

```bash
# Build verification
npm run build

# Type checking
npm run type-check

# Start dev server
npm run dev

# Visit /admin/appearance to test style switching
```

### 📝 Notes

- Default styles are used as fallback if DB is unavailable
- Cache is automatically cleared when admin updates settings
- All pages using `ResponsiveLayout` will automatically use dynamic styles
- Legacy `Header` component still available for backward compatibility

### 🚀 Deployment

1. Run migration: `npx prisma migrate deploy`
2. Run seed: `npm run db:seed` (creates default settings)
3. Deploy application
4. Access `/admin/appearance` to configure

### 🎯 Future Enhancements

- [ ] Menu style components (4 variants planned)
- [ ] Theme color customization
- [ ] Custom CSS injection
- [ ] Style preview without activation
- [ ] Import/export style configurations
- [ ] A/B testing integration
- [ ] Analytics per style variant
