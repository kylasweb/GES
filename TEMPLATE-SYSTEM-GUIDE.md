# Landing Page Template System - Implementation Guide

## Overview
Create a Template Gallery system that allows users to switch between different landing page designs dynamically without code changes.

## Architecture

### Database Schema

```prisma
// Add to schema.prisma
model LandingTemplate {
  id          String   @id @default(cuid())
  name        String   // "Default", "Flipkart Style", "Neomorphic"
  slug        String   @unique // "default", "flipkart", "neomorphic"
  description String?
  thumbnail   String?  // Preview image URL
  isActive    Boolean  @default(false)
  config      Json?    // Template-specific configuration
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model SiteSettings {
  id                String   @id @default(cuid())
  activeTemplateId  String?
  activeTemplate    LandingTemplate? @relation(fields: [activeTemplateId], references: [id])
  // ... other site settings
}
```

### File Structure

```
src/
├── app/
│   ├── page.tsx                        # Main landing page (dynamic template renderer)
│   └── admin/
│       └── templates/
│           └── page.tsx                # Template gallery management
├── components/
│   ├── templates/
│   │   ├── default/
│   │   │   ├── hero.tsx
│   │   │   ├── features.tsx
│   │   │   └── products.tsx
│   │   ├── flipkart/
│   │   │   ├── hero.tsx
│   │   │   ├── categories-grid.tsx
│   │   │   ├── deals-section.tsx
│   │   │   └── products-carousel.tsx
│   │   └── neomorphic/
│   │       ├── hero.tsx
│   │       ├── features-neo.tsx
│   │       └── products-neo.tsx
│   └── template-renderer.tsx           # Dynamic template loader
└── lib/
    └── templates/
        └── template-config.ts          # Template metadata and registry
```

## Implementation Steps

### Step 1: Create Database Migration

```bash
npx prisma migrate dev --name add_landing_templates
```

### Step 2: Template Registry

```typescript
// lib/templates/template-config.ts
export interface TemplateMetadata {
  id: string;
  name: string;
  slug: string;
  description: string;
  thumbnail: string;
  features: string[];
  colorScheme: 'light' | 'dark' | 'both';
  tags: string[];
}

export const TEMPLATES: Record<string, TemplateMetadata> = {
  default: {
    id: 'default',
    name: 'Default Template',
    slug: 'default',
    description: 'Clean, modern design with focus on products and features',
    thumbnail: '/templates/default-preview.jpg',
    features: ['Hero section', 'Features grid', 'Product showcase', 'Testimonials'],
    colorScheme: 'light',
    tags: ['modern', 'clean', 'professional']
  },
  flipkart: {
    id: 'flipkart',
    name: 'E-Commerce Pro',
    slug: 'flipkart',
    description: 'Inspired by leading e-commerce platforms with category focus',
    thumbnail: '/templates/flipkart-preview.jpg',
    features: ['Categories grid', 'Deals carousel', 'Product cards', 'Quick filters'],
    colorScheme: 'light',
    tags: ['e-commerce', 'marketplace', 'categories']
  },
  neomorphic: {
    id: 'neomorphic',
    name: 'Neomorphic Design',
    slug: 'neomorphic',
    description: 'Modern soft UI with elegant shadows and depth',
    thumbnail: '/templates/neomorphic-preview.jpg',
    features: ['Soft shadows', 'Glassmorphism', 'Smooth animations', 'Elegant cards'],
    colorScheme: 'both',
    tags: ['modern', 'elegant', 'premium']
  }
};
```

### Step 3: Template Renderer Component

```typescript
// components/template-renderer.tsx
'use client';

import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

interface TemplateRendererProps {
  templateSlug: string;
  data?: any;
}

const templateComponents = {
  default: lazy(() => import('./templates/default/landing')),
  flipkart: lazy(() => import('./templates/flipkart/landing')),
  neomorphic: lazy(() => import('./templates/neomorphic/landing')),
};

export function TemplateRenderer({ templateSlug, data }: TemplateRendererProps) {
  const TemplateComponent = templateComponents[templateSlug] || templateComponents.default;

  return (
    <Suspense fallback={<TemplateLoadingSkeleton />}>
      <TemplateComponent data={data} />
    </Suspense>
  );
}

function TemplateLoadingSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-[500px] w-full" />
      <Skeleton className="h-[300px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  );
}
```

### Step 4: Main Landing Page (Dynamic)

```typescript
// app/page.tsx
import { prisma } from '@/lib/db';
import { TemplateRenderer } from '@/components/template-renderer';

async function getActiveTemplate() {
  const settings = await prisma.siteSettings.findFirst({
    include: { activeTemplate: true }
  });
  
  return settings?.activeTemplate?.slug || 'default';
}

async function getLandingData() {
  // Fetch all data needed for landing pages
  const [categories, products, deals] = await Promise.all([
    prisma.category.findMany({ where: { isActive: true }, take: 8 }),
    prisma.product.findMany({ 
      where: { isActive: true, featured: true }, 
      include: { category: true, brand: true },
      take: 12 
    }),
    prisma.deal.findMany({ where: { isActive: true }, take: 6 })
  ]);

  return { categories, products, deals };
}

export default async function HomePage() {
  const [templateSlug, data] = await Promise.all([
    getActiveTemplate(),
    getLandingData()
  ]);

  return <TemplateRenderer templateSlug={templateSlug} data={data} />;
}
```

## Template Designs

### 1. Flipkart-Style Template

**Key Features**:
- Top banner carousel with offers
- Category grid (8 categories with icons)
- Horizontal scrolling deals section
- Product grid with filters
- Quick view on hover
- Flash sales timer
- Footer with sitemap

**Layout**:
```
┌─────────────────────────────────────┐
│  Header (Logo, Search, Cart, User)  │
├─────────────────────────────────────┤
│  Promotional Banner Carousel        │
├─────────────────────────────────────┤
│  Categories Grid (8 items, 4x2)     │
├─────────────────────────────────────┤
│  Flash Deals (Horizontal Scroll)    │
├─────────────────────────────────────┤
│  Featured Products (4x3 Grid)       │
├─────────────────────────────────────┤
│  Banner (Seasonal Offers)           │
├─────────────────────────────────────┤
│  Best Sellers (Horizontal Scroll)   │
├─────────────────────────────────────┤
│  Footer (5 columns)                 │
└─────────────────────────────────────┘
```

**Components**:
```typescript
// components/templates/flipkart/landing.tsx
export default function FlipkartTemplate({ data }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <FlipkartHeader />
      <PromotionalBanner />
      <CategoriesGrid categories={data.categories} />
      <FlashDealsSection deals={data.deals} />
      <ProductGrid products={data.products} />
      <SeasonalBanner />
      <BestSellersCarousel products={data.products} />
      <FlipkartFooter />
    </div>
  );
}
```

**Color Scheme**:
- Primary: Blue (#2874f0)
- Accent: Orange (#ff6f00)
- Background: Light gray (#f1f3f6)
- Cards: White with subtle shadows

### 2. Neomorphic Template

**Key Features**:
- Soft UI with inset/outset shadows
- Glassmorphism effects
- Smooth gradient backgrounds
- Floating cards
- Subtle animations
- Premium feel
- Dark mode support

**Layout**:
```
┌─────────────────────────────────────┐
│  Header (Translucent, Glass Effect) │
├─────────────────────────────────────┤
│  Hero (Gradient BG, Floating Cards) │
├─────────────────────────────────────┤
│  Features (Neumorphic Cards, 3col)  │
├─────────────────────────────────────┤
│  Products (Soft Cards, Grid)        │
├─────────────────────────────────────┤
│  Stats Section (Glassmorphism)      │
├─────────────────────────────────────┤
│  CTA (Gradient Button, Large)       │
├─────────────────────────────────────┤
│  Footer (Minimal, Glass Effect)     │
└─────────────────────────────────────┘
```

**CSS Classes** (Tailwind):
```css
/* Neumorphic shadow utilities */
.neo-raised {
  box-shadow: 
    12px 12px 24px rgba(0, 0, 0, 0.1),
    -12px -12px 24px rgba(255, 255, 255, 0.8);
}

.neo-inset {
  box-shadow: 
    inset 8px 8px 16px rgba(0, 0, 0, 0.1),
    inset -8px -8px 16px rgba(255, 255, 255, 0.8);
}

.glass {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}
```

**Components**:
```typescript
// components/templates/neomorphic/landing.tsx
export default function NeomorphicTemplate({ data }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <NeomorphicHeader />
      <HeroWithFloatingCards />
      <FeaturesNeomorphic />
      <ProductsNeomorphic products={data.products} />
      <StatsGlass />
      <CTASection />
      <NeomorphicFooter />
    </div>
  );
}
```

**Color Palette**:
- Background: Linear gradient (#e0e5ec to #f0f4f8)
- Cards: #e0e5ec
- Accents: Soft blue (#5e81ac)
- Text: Dark gray (#2e3440)
- Highlights: Light (#eceff4)

## Admin Template Gallery

### Template Management UI

```typescript
// app/admin/templates/page.tsx
'use client';

export default function TemplateGalleryPage() {
  const [templates, setTemplates] = useState([]);
  const [activeTemplate, setActiveTemplate] = useState('');

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Landing Page Templates</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map(template => (
          <TemplateCard
            key={template.id}
            template={template}
            isActive={activeTemplate === template.slug}
            onActivate={() => activateTemplate(template.slug)}
            onPreview={() => previewTemplate(template.slug)}
          />
        ))}
      </div>
    </div>
  );
}

function TemplateCard({ template, isActive, onActivate, onPreview }) {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 bg-gray-200">
        <img 
          src={template.thumbnail} 
          alt={template.name}
          className="w-full h-full object-cover"
        />
        {isActive && (
          <Badge className="absolute top-2 right-2 bg-green-600">
            Active
          </Badge>
        )}
      </div>
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-2">{template.name}</h3>
        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.map(tag => (
            <Badge key={tag} variant="secondary">{tag}</Badge>
          ))}
        </div>

        <div className="flex space-x-2">
          <Button 
            onClick={onPreview} 
            variant="outline" 
            className="flex-1"
          >
            Preview
          </Button>
          {!isActive && (
            <Button 
              onClick={onActivate} 
              className="flex-1"
            >
              Activate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
```

### API Endpoints

```typescript
// app/api/v1/admin/templates/route.ts
export async function GET() {
  const templates = await prisma.landingTemplate.findMany();
  const settings = await prisma.siteSettings.findFirst();
  
  return Response.json({
    success: true,
    data: {
      templates,
      activeTemplateId: settings?.activeTemplateId
    }
  });
}

export async function POST(request: Request) {
  const { templateId } = await request.json();
  
  const settings = await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: { activeTemplateId: templateId },
    create: { id: 'default', activeTemplateId: templateId }
  });

  // Revalidate homepage
  revalidatePath('/');

  return Response.json({
    success: true,
    data: settings
  });
}
```

## Preview System

### Template Preview Modal

```typescript
function TemplatePreview({ templateSlug, onClose }) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh]">
        <DialogHeader>
          <DialogTitle>Template Preview</DialogTitle>
        </DialogHeader>
        <iframe
          src={`/preview/${templateSlug}`}
          className="w-full h-full border-0"
        />
      </DialogContent>
    </Dialog>
  );
}

// app/preview/[slug]/page.tsx
export default async function PreviewPage({ params }) {
  const data = await getLandingData();
  return <TemplateRenderer templateSlug={params.slug} data={data} />;
}
```

## Configuration System

### Template-Specific Settings

```typescript
interface TemplateConfig {
  colors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  layout?: {
    containerWidth: 'full' | 'container' | 'narrow';
    spacing: 'compact' | 'normal' | 'spacious';
  };
  features?: {
    showCategories: boolean;
    showDeals: boolean;
    showTestimonials: boolean;
    carouselAutoplay: boolean;
  };
}

// Stored in LandingTemplate.config JSON field
```

## Seed Data

```typescript
// prisma/seed-templates.ts
const templates = [
  {
    name: 'Default Template',
    slug: 'default',
    description: 'Clean, modern design',
    thumbnail: '/uploads/templates/default.jpg',
    isActive: true,
    config: {}
  },
  {
    name: 'E-Commerce Pro',
    slug: 'flipkart',
    description: 'Marketplace-style layout',
    thumbnail: '/uploads/templates/flipkart.jpg',
    isActive: false,
    config: {
      features: {
        showCategories: true,
        showDeals: true,
        carouselAutoplay: true
      }
    }
  },
  {
    name: 'Neomorphic Design',
    slug: 'neomorphic',
    description: 'Premium soft UI',
    thumbnail: '/uploads/templates/neomorphic.jpg',
    isActive: false,
    config: {
      colors: {
        primary: '#5e81ac',
        background: '#e0e5ec'
      }
    }
  }
];
```

## Benefits

1. **No Code Switching**: Change entire landing page design instantly
2. **A/B Testing**: Easily test different layouts
3. **Seasonal Themes**: Switch for holidays, sales events
4. **Client Customization**: Offer different designs to different clients
5. **Easy Maintenance**: Isolated template code
6. **Scalable**: Add unlimited templates

## Implementation Priority

1. **Phase 1** (High Priority):
   - Database schema
   - Template registry
   - Template renderer component
   - Admin template gallery UI
   - API endpoints

2. **Phase 2** (Medium Priority):
   - Flipkart-style template
   - Neomorphic template
   - Preview system

3. **Phase 3** (Future):
   - Template customization UI
   - Template builder (drag & drop)
   - Template marketplace

## Testing Checklist

- [ ] Create all three templates
- [ ] Test template switching
- [ ] Verify data loads correctly in all templates
- [ ] Test preview system
- [ ] Check responsive design on all templates
- [ ] Test dark mode (neomorphic)
- [ ] Verify performance (lazy loading)
- [ ] Test cache invalidation on template change

## Performance Considerations

- Lazy load template components
- Cache template selection
- Optimize images
- Use ISR (Incremental Static Regeneration)
- CDN for template assets
- Minimize bundle size per template

---

This comprehensive guide provides everything needed to implement the template system. Would you like me to start implementing any specific part?
