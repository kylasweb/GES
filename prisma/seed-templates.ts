import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const templates = [
    {
        name: 'Marketplace Pro',
        slug: 'marketplace-pro',
        description: 'Amazon-inspired clean, product-focused layout with featured categories and deals sections.',
        thumbnail: '/templates/marketplace-pro.jpg',
        colorScheme: 'light',
        features: [
            'Multi-column category grid',
            'Featured deals carousel',
            'Today\'s deals section',
            'Search-prominent header',
            'Product quick view',
            'Smart recommendations'
        ],
        tags: ['marketplace', 'categories', 'professional', 'e-commerce'],
        config: {
            hero: {
                type: 'category-grid',
                showSearch: true,
                categories: 'featured',
            },
            sections: [
                { type: 'deals', title: 'Today\'s Deals', limit: 8 },
                { type: 'categories', layout: 'grid', columns: 4 },
                { type: 'featured-products', limit: 12 },
                { type: 'recommendations', title: 'Recommended for You' }
            ],
            colors: {
                primary: '#FF9900',
                secondary: '#232F3E',
                accent: '#37475A',
                background: '#FFFFFF',
                text: '#0F1111'
            },
            typography: {
                headingFont: 'Amazon Ember, Arial, sans-serif',
                bodyFont: 'Amazon Ember, Arial, sans-serif'
            }
        }
    },
    {
        name: 'Modern Commerce',
        slug: 'modern-commerce',
        description: 'Shopify-inspired minimalist design focused on conversion with clean product showcases.',
        thumbnail: '/templates/modern-commerce.jpg',
        colorScheme: 'light',
        features: [
            'Hero with strong CTA',
            'Product collections',
            'Social proof section',
            'Feature highlights',
            'Newsletter signup',
            'Testimonials'
        ],
        tags: ['modern', 'clean', 'professional', 'e-commerce'],
        config: {
            hero: {
                type: 'full-width-cta',
                showVideo: false,
                ctaStyle: 'prominent',
            },
            sections: [
                { type: 'featured-collections', limit: 3 },
                { type: 'social-proof', showStats: true },
                { type: 'products', layout: 'grid', limit: 8 },
                { type: 'features', layout: 'horizontal' },
                { type: 'testimonials', limit: 6 },
                { type: 'newsletter' }
            ],
            colors: {
                primary: '#5C6AC4',
                secondary: '#00848E',
                accent: '#BF0711',
                background: '#F4F6F8',
                text: '#212B36'
            },
            typography: {
                headingFont: 'Inter, Helvetica, sans-serif',
                bodyFont: 'Inter, Helvetica, sans-serif'
            }
        }
    },
    {
        name: 'Premium Elegance',
        slug: 'premium-elegance',
        description: 'Apple-style minimal premium design with large product heroes and elegant typography.',
        thumbnail: '/templates/premium-elegance.jpg',
        colorScheme: 'auto',
        features: [
            'Large hero product showcase',
            'Smooth scroll sections',
            'Premium typography',
            'High-quality imagery',
            'Minimalist navigation',
            'Dark mode support'
        ],
        tags: ['premium', 'elegant', 'clean', 'glassmorphism'],
        config: {
            hero: {
                type: 'product-hero',
                fullScreen: true,
                parallax: true,
            },
            sections: [
                { type: 'featured-product', layout: 'hero' },
                { type: 'product-grid', spacing: 'wide', limit: 6 },
                { type: 'features', style: 'minimal', iconStyle: 'line' },
                { type: 'gallery', fullWidth: true }
            ],
            colors: {
                primary: '#000000',
                secondary: '#86868B',
                accent: '#0071E3',
                background: '#FFFFFF',
                backgroundDark: '#000000',
                text: '#1D1D1F',
                textDark: '#F5F5F7'
            },
            typography: {
                headingFont: 'SF Pro Display, -apple-system, sans-serif',
                bodyFont: 'SF Pro Text, -apple-system, sans-serif'
            }
        }
    },
    {
        name: 'Athletic Bold',
        slug: 'athletic-bold',
        description: 'Nike-inspired bold dynamic design with lifestyle focus and inspirational messaging.',
        thumbnail: '/templates/athletic-bold.jpg',
        colorScheme: 'dark',
        features: [
            'Full-screen hero',
            'Video backgrounds',
            'Collection highlights',
            'Inspirational messaging',
            'Athletes showcase',
            'Bold typography'
        ],
        tags: ['modern', 'bold', 'premium', 'e-commerce'],
        config: {
            hero: {
                type: 'video-hero',
                fullScreen: true,
                autoplay: true,
            },
            sections: [
                { type: 'collection-banner', style: 'full-width' },
                { type: 'featured-products', layout: 'lifestyle', limit: 4 },
                { type: 'inspiration', showQuotes: true },
                { type: 'athletes', layout: 'grid' },
                { type: 'products', style: 'bold', limit: 8 }
            ],
            colors: {
                primary: '#000000',
                secondary: '#FFFFFF',
                accent: '#FA5400',
                background: '#111111',
                text: '#FFFFFF'
            },
            typography: {
                headingFont: 'Helvetica Neue, Helvetica, Arial, sans-serif',
                bodyFont: 'Helvetica Neue, Helvetica, Arial, sans-serif'
            }
        }
    },
    {
        name: 'Artisan Market',
        slug: 'artisan-market',
        description: 'Etsy-inspired warm handcrafted feel with grid-based product showcase and seller stories.',
        thumbnail: '/templates/artisan-market.jpg',
        colorScheme: 'light',
        features: [
            'Grid product showcase',
            'Featured sellers',
            'Category browsing',
            'Story-driven content',
            'Handpicked collections',
            'Warm color palette'
        ],
        tags: ['marketplace', 'handcrafted', 'warm', 'e-commerce'],
        config: {
            hero: {
                type: 'banner-with-categories',
                style: 'warm',
                showSearch: true,
            },
            sections: [
                { type: 'featured-sellers', limit: 4 },
                { type: 'categories', layout: 'masonry' },
                { type: 'products', layout: 'grid', columns: 4, limit: 12 },
                { type: 'stories', style: 'cards' },
                { type: 'collections', curated: true }
            ],
            colors: {
                primary: '#F56400',
                secondary: '#222222',
                accent: '#F1651F',
                background: '#FFF8F1',
                text: '#222222'
            },
            typography: {
                headingFont: 'Guardian-EgypTT, Georgia, serif',
                bodyFont: 'Graphik Webfont, -apple-system, sans-serif'
            }
        }
    },
    {
        name: 'Tech Innovation',
        slug: 'tech-innovation',
        description: 'Tesla-inspired futuristic tech-forward design with clean CTAs and interactive elements.',
        thumbnail: '/templates/tech-innovation.jpg',
        colorScheme: 'dark',
        features: [
            'Full-width product images',
            'Stats and specifications',
            'Interactive elements',
            'Clean CTA buttons',
            'Futuristic design',
            'Smooth animations'
        ],
        tags: ['modern', 'premium', 'tech', 'glassmorphism'],
        config: {
            hero: {
                type: 'split-screen',
                productImage: 'prominent',
                specs: true,
            },
            sections: [
                { type: 'product-specs', layout: 'detailed' },
                { type: 'stats', showAnimations: true },
                { type: 'features', style: 'tech', icons: true },
                { type: 'products', layout: 'minimal', limit: 6 },
                { type: 'cta-section', style: 'bold' }
            ],
            colors: {
                primary: '#000000',
                secondary: '#FFFFFF',
                accent: '#E31937',
                background: '#000000',
                text: '#FFFFFF'
            },
            typography: {
                headingFont: 'Gotham SSm, -apple-system, sans-serif',
                bodyFont: 'Gotham SSm, -apple-system, sans-serif'
            }
        }
    }
];

async function main() {
    console.log('Starting template seeding...');

    for (const template of templates) {
        const existing = await prisma.landingTemplate.findUnique({
            where: { slug: template.slug }
        });

        if (existing) {
            console.log(`Template "${template.name}" already exists, updating...`);
            await prisma.landingTemplate.update({
                where: { slug: template.slug },
                data: template
            });
        } else {
            console.log(`Creating template "${template.name}"...`);
            await prisma.landingTemplate.create({
                data: template
            });
        }
    }

    // Set the first template as active if none is active
    const activeTemplate = await prisma.landingTemplate.findFirst({
        where: { isActive: true }
    });

    if (!activeTemplate) {
        await prisma.landingTemplate.update({
            where: { slug: 'marketplace-pro' },
            data: { isActive: true }
        });
        console.log('Set "Marketplace Pro" as the active template');
    }

    console.log('Template seeding completed!');
}

main()
    .catch((e) => {
        console.error('Error seeding templates:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
