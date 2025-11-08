import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTemplates() {
    console.log('🎨 Seeding landing templates...');

    const templates = [
        {
            name: 'Default Template',
            slug: 'default',
            description: 'Clean, modern design with focus on products and features. Perfect for professional businesses.',
            thumbnail: '/uploads/templates/default-preview.jpg',
            isActive: true,
            features: ['Hero section', 'Features grid', 'Product showcase', 'Testimonials', 'Newsletter signup'],
            colorScheme: 'light',
            tags: ['modern', 'clean', 'professional', 'default'],
            config: {
                layout: {
                    containerWidth: 'container',
                    spacing: 'normal'
                },
                features: {
                    showCategories: true,
                    showTestimonials: true,
                    carouselAutoplay: false
                }
            }
        },
        {
            name: 'E-Commerce Pro',
            slug: 'flipkart',
            description: 'Marketplace-style layout inspired by leading e-commerce platforms. Optimized for high-volume catalogs.',
            thumbnail: '/uploads/templates/flipkart-preview.jpg',
            isActive: false,
            features: ['Categories grid', 'Flash deals carousel', 'Product cards with quick view', 'Advanced filters', 'Promotional banners'],
            colorScheme: 'light',
            tags: ['e-commerce', 'marketplace', 'categories', 'deals'],
            config: {
                layout: {
                    containerWidth: 'full',
                    spacing: 'compact'
                },
                features: {
                    showCategories: true,
                    showDeals: true,
                    carouselAutoplay: true,
                    showQuickView: true
                },
                colors: {
                    primary: '#2874f0',
                    accent: '#ff6f00',
                    background: '#f1f3f6'
                }
            }
        },
        {
            name: 'Neomorphic Design',
            slug: 'neomorphic',
            description: 'Premium soft UI with elegant shadows, glassmorphism effects, and smooth animations. Modern and luxurious.',
            thumbnail: '/uploads/templates/neomorphic-preview.jpg',
            isActive: false,
            features: ['Soft shadows', 'Glassmorphism effects', 'Smooth animations', 'Elegant cards', 'Dark mode support'],
            colorScheme: 'both',
            tags: ['modern', 'elegant', 'premium', 'glassmorphism', 'neumorphic'],
            config: {
                layout: {
                    containerWidth: 'container',
                    spacing: 'spacious'
                },
                features: {
                    showCategories: false,
                    showTestimonials: true,
                    carouselAutoplay: false,
                    enableGlassmorphism: true
                },
                colors: {
                    primary: '#5e81ac',
                    background: '#e0e5ec',
                    text: '#2e3440'
                }
            }
        }
    ];

    for (const template of templates) {
        await prisma.landingTemplate.upsert({
            where: { slug: template.slug },
            update: template,
            create: template
        });
    }

    console.log('✅ Landing templates seeded');
}

async function seedFeatureFlags() {
    console.log('🚩 Seeding feature flags...');

    const features = [
        {
            key: 'ai_product_generation',
            name: 'AI Product Generation',
            description: 'Enable AI-powered product generation using Puter.js',
            enabled: true,
            rollout: 100,
            category: 'ai',
            config: {
                maxGenerationsPerDay: 50,
                enableImageGeneration: false
            }
        },
        {
            key: 'ai_image_generation',
            name: 'AI Image Generation',
            description: 'Auto-generate product images using AI',
            enabled: false,
            rollout: 0,
            category: 'ai',
            config: {
                provider: 'puter',
                maxImagesPerProduct: 4
            }
        },
        {
            key: 'template_switching',
            name: 'Template Switching',
            description: 'Allow admins to switch landing page templates',
            enabled: true,
            rollout: 100,
            category: 'templates'
        },
        {
            key: 'media_library',
            name: 'Media Library',
            description: 'Enable advanced media library with upload/edit/delete',
            enabled: true,
            rollout: 100,
            category: 'admin'
        },
        {
            key: 'bulk_product_import',
            name: 'Bulk Product Import',
            description: 'Enable CSV bulk product upload',
            enabled: true,
            rollout: 100,
            category: 'admin'
        },
        {
            key: 'custom_fields',
            name: 'Product Custom Fields',
            description: 'Enable flexible custom fields for products',
            enabled: true,
            rollout: 100,
            category: 'products'
        },
        {
            key: 'real_time_inventory',
            name: 'Real-time Inventory',
            description: 'Enable real-time inventory tracking and alerts',
            enabled: false,
            rollout: 50,
            category: 'inventory',
            config: {
                lowStockThreshold: 10,
                autoReorderEnabled: false
            }
        },
        {
            key: 'advanced_analytics',
            name: 'Advanced Analytics',
            description: 'Enable advanced analytics dashboard with AI insights',
            enabled: false,
            rollout: 0,
            category: 'analytics'
        },
        {
            key: 'multi_currency',
            name: 'Multi-Currency Support',
            description: 'Enable multiple currency support for international sales',
            enabled: false,
            rollout: 0,
            category: 'payments',
            config: {
                defaultCurrency: 'INR',
                supportedCurrencies: ['INR', 'USD', 'EUR']
            }
        },
        {
            key: 'wishlist',
            name: 'Customer Wishlist',
            description: 'Enable wishlist functionality for customers',
            enabled: true,
            rollout: 100,
            category: 'features'
        },
        {
            key: 'product_reviews',
            name: 'Product Reviews',
            description: 'Enable customer product reviews and ratings',
            enabled: true,
            rollout: 100,
            category: 'features'
        },
        {
            key: 'live_chat',
            name: 'Live Chat Support',
            description: 'Enable live chat widget for customer support',
            enabled: false,
            rollout: 0,
            category: 'support'
        }
    ];

    for (const feature of features) {
        await prisma.featureFlag.upsert({
            where: { key: feature.key },
            update: feature,
            create: feature
        });
    }

    console.log('✅ Feature flags seeded');
}

async function seedSiteSettings() {
    console.log('⚙️ Seeding site settings...');

    const defaultTemplate = await prisma.landingTemplate.findUnique({
        where: { slug: 'default' }
    });

    await prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: {
            activeTemplateId: defaultTemplate?.id
        },
        create: {
            id: 'default',
            siteName: 'Green Energy Solutions',
            siteDescription: 'Leading provider of renewable energy solutions including solar panels, batteries, and energy storage systems.',
            contactEmail: 'support@greenenergysolutions.in',
            contactPhone: '+91-1234567890',
            activeTemplateId: defaultTemplate?.id,
            maintenanceMode: false,
            config: {
                features: {
                    enableNewsletter: true,
                    enableBlog: false,
                    enableLiveChat: false
                },
                seo: {
                    metaTitle: 'Green Energy Solutions - Renewable Energy Products',
                    metaDescription: 'Shop premium solar panels, batteries, and energy solutions. Free delivery across India.'
                },
                social: {
                    facebook: 'https://facebook.com/greenenergysolutions',
                    twitter: 'https://twitter.com/greenenergysol',
                    instagram: 'https://instagram.com/greenenergysolutions'
                }
            }
        }
    });

    console.log('✅ Site settings seeded');
}

async function seedGitVersions() {
    console.log('📦 Seeding git versions...');

    const versions = [
        {
            version: 'v1.0.0',
            commitHash: 'abc123def456',
            commitMessage: 'Initial production release',
            branch: 'main',
            author: 'Development Team',
            deployedBy: 'admin@greenenergysolutions.in',
            isActive: false,
            changelog: [
                'Product catalog system',
                'User authentication',
                'Order management',
                'Payment integration'
            ],
            environment: 'production',
            rollbackable: true,
            metadata: {
                buildTime: '2024-01-15T10:00:00Z',
                deploymentDuration: 180
            }
        },
        {
            version: 'v1.1.0',
            commitHash: 'def456ghi789',
            commitMessage: 'Added media library and AI features',
            branch: 'main',
            author: 'Development Team',
            deployedBy: 'admin@greenenergysolutions.in',
            isActive: true,
            changelog: [
                'Media library with upload/edit/delete',
                'AI product generation with Puter.js',
                'Custom fields support',
                'Enhanced SEO fields',
                'MediaPicker integration'
            ],
            environment: 'production',
            rollbackable: true,
            metadata: {
                buildTime: new Date().toISOString(),
                deploymentDuration: 210,
                features: ['media-library', 'ai-generation', 'custom-fields']
            }
        }
    ];

    for (const version of versions) {
        await prisma.gitVersion.upsert({
            where: { version: version.version },
            update: version,
            create: version
        });
    }

    console.log('✅ Git versions seeded');
}

async function main() {
    console.log('\n🌱 Starting advanced features seed...\n');

    try {
        await seedTemplates();
        await seedFeatureFlags();
        await seedSiteSettings();
        await seedGitVersions();

        console.log('\n✨ Advanced features seed completed successfully!\n');
    } catch (error) {
        console.error('❌ Seed failed:', error);
        throw error;
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
