import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create admin users
  const adminUsers = [
    {
      email: 'admin@greenenergysolutions.in',
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      password: 'admin123'
    },
    {
      email: 'content@greenenergysolutions.in',
      name: 'Content Manager',
      role: 'CONTENT_MANAGER',
      password: 'content123'
    },
    {
      email: 'orders@greenenergysolutions.in',
      name: 'Order Manager',
      role: 'ORDER_MANAGER',
      password: 'orders123'
    },
    {
      email: 'finance@greenenergysolutions.in',
      name: 'Finance Manager',
      role: 'FINANCE_MANAGER',
      password: 'finance123'
    },
    {
      email: 'customer@test.com',
      name: 'Test Customer',
      role: 'CUSTOMER',
      password: 'customer123'
    }
  ];

  for (const adminData of adminUsers) {
    const hashedPassword = await bcrypt.hash(adminData.password, 12);

    await prisma.user.upsert({
      where: { email: adminData.email },
      update: {},
      create: {
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        role: adminData.role as any,
        isActive: true,
      },
    });

    console.log(`Created user: ${adminData.email} (${adminData.role})`);
  }

  // Create categories
  const batteriesCategory = await prisma.category.upsert({
    where: { slug: 'batteries' },
    update: {},
    create: {
      name: 'Batteries',
      slug: 'batteries',
      description: 'High-capacity batteries for energy storage',
      sortOrder: 1,
    },
  });

  const solarPanelsCategory = await prisma.category.upsert({
    where: { slug: 'solar-panels' },
    update: {},
    create: {
      name: 'Solar Panels',
      slug: 'solar-panels',
      description: 'Efficient solar panels for renewable energy',
      sortOrder: 2,
    },
  });

  const accessoriesCategory = await prisma.category.upsert({
    where: { slug: 'accessories' },
    update: {},
    create: {
      name: 'Accessories',
      slug: 'accessories',
      description: 'Accessories for solar and battery systems',
      sortOrder: 3,
    },
  });

  // Create products
  const products = [
    {
      name: 'Lithium Ion Battery 12V 100Ah',
      slug: 'lithium-ion-battery-12v-100ah',
      description: 'High-quality lithium ion battery with long cycle life and excellent performance. Perfect for solar energy storage and backup power systems.',
      shortDesc: '12V 100Ah Lithium Ion Battery with 10-year warranty',
      sku: 'LIB-12V-100AH',
      price: 15000,
      comparePrice: 18000,
      costPrice: 12000,
      trackQuantity: true,
      quantity: 50,
      weight: 12.5,
      dimensions: { length: 40, width: 20, height: 25 },
      images: [
        'https://images.unsplash.com/photo-1622304222611-0ad0b575a3ce?w=400&h=400&fit=crop',
      ],
      tags: ['lithium', 'battery', 'solar', 'storage'],
      featured: true,
      seoTitle: '12V 100Ah Lithium Ion Battery | Green Energy Solutions',
      seoDesc: 'Premium lithium ion battery for solar energy storage. Long life, reliable performance.',
      categoryId: batteriesCategory.id,
    },
    {
      name: 'Solar Panel 300W Monocrystalline',
      slug: 'solar-panel-300w-monocrystalline',
      description: 'High-efficiency monocrystalline solar panel with 300W output. Ideal for residential and commercial solar installations.',
      shortDesc: '300W Monocrystalline Solar Panel with 25-year warranty',
      sku: 'SP-300W-MONO',
      price: 12000,
      comparePrice: 15000,
      costPrice: 9500,
      trackQuantity: true,
      quantity: 30,
      weight: 18.5,
      dimensions: { length: 165, width: 99, height: 4 },
      images: [
        'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=400&fit=crop',
      ],
      tags: ['solar', 'panel', 'monocrystalline', 'renewable'],
      featured: true,
      seoTitle: '300W Monocrystalline Solar Panel | Green Energy Solutions',
      seoDesc: 'High-efficiency solar panel for maximum energy generation.',
      categoryId: solarPanelsCategory.id,
    },
    {
      name: 'Battery Management System BMS',
      slug: 'battery-management-system-bms',
      description: 'Advanced Battery Management System for monitoring and protecting lithium battery packs. Includes overcharge, over-discharge, and short circuit protection.',
      shortDesc: 'Smart BMS for battery protection and monitoring',
      sku: 'BMS-48V-100A',
      price: 3500,
      comparePrice: 4200,
      costPrice: 2800,
      trackQuantity: true,
      quantity: 100,
      weight: 2.5,
      dimensions: { length: 20, width: 15, height: 8 },
      images: [
        'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=400&fit=crop',
      ],
      tags: ['bms', 'battery', 'management', 'protection'],
      featured: false,
      seoTitle: 'Battery Management System BMS | Green Energy Solutions',
      seoDesc: 'Advanced BMS for complete battery protection and monitoring.',
      categoryId: accessoriesCategory.id,
    },
    {
      name: 'Solar Charge Controller 20A',
      slug: 'solar-charge-controller-20a',
      description: 'PWM solar charge controller with 20A capacity. Features LCD display, USB charging port, and multiple battery type compatibility.',
      shortDesc: '20A PWM Solar Charge Controller with LCD display',
      sku: 'SCC-20A-PWM',
      price: 1800,
      comparePrice: 2200,
      costPrice: 1400,
      trackQuantity: true,
      quantity: 75,
      weight: 1.2,
      dimensions: { length: 15, width: 10, height: 5 },
      images: [
        'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=400&fit=crop',
      ],
      tags: ['charge', 'controller', 'solar', 'pwm'],
      featured: false,
      seoTitle: '20A Solar Charge Controller | Green Energy Solutions',
      seoDesc: 'Reliable PWM charge controller for solar systems.',
      categoryId: accessoriesCategory.id,
    },
  ];

  for (const productData of products) {
    await prisma.product.upsert({
      where: { sku: productData.sku },
      update: productData,
      create: productData,
    });
  }

  // Create inventory for products
  for (const productData of products) {
    // First get the created product to use its ID
    const createdProduct = await prisma.product.findUnique({
      where: { sku: productData.sku }
    });

    if (createdProduct) {
      await prisma.productInventory.upsert({
        where: { productId: createdProduct.id },
        update: {
          quantity: productData.quantity,
          lowStockThreshold: 10,
          reorderPoint: 5,
        },
        create: {
          productId: createdProduct.id,
          quantity: productData.quantity,
          lowStockThreshold: 10,
          reorderPoint: 5,
        },
      });
    }
  }

  // Create content blocks for landing page
  const heroContent = await prisma.contentBlock.upsert({
    where: { id: 'hero-banner' },
    update: {},
    create: {
      id: 'hero-banner',
      type: 'HERO_BANNER',
      title: 'Welcome to Green Energy Solutions',
      content: {
        headline: 'Power Your Future with Green Energy Solutions',
        subtitle: 'Discover our premium range of eco-friendly batteries and solar panels designed for a sustainable tomorrow.',
        ctaText: 'Shop Products',
        ctaLink: '#products',
        backgroundImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=1920&h=1080&fit=crop'
      },
      order: 1,
    },
  });

  const featuredProductsContent = await prisma.contentBlock.upsert({
    where: { id: 'featured-products' },
    update: {},
    create: {
      id: 'featured-products',
      type: 'FEATURED_PRODUCTS',
      title: 'Featured Products',
      content: {
        headline: 'Our Premium Products',
        subtitle: 'Hand-picked selection of our best-selling green energy solutions',
      },
      order: 2,
    },
  });

  const infoSectionContent = await prisma.contentBlock.upsert({
    where: { id: 'info-section' },
    update: {},
    create: {
      id: 'info-section',
      type: 'INFO_SECTION',
      title: 'Why Choose Us',
      content: {
        description: 'We are committed to providing the best green energy solutions for our customers.',
        features: [
          {
            title: 'Quality Products',
            description: 'Only the highest quality products with manufacturer warranties',
            icon: 'shield'
          },
          {
            title: 'Expert Support',
            description: 'Our team of experts is always ready to help you',
            icon: 'users'
          },
          {
            title: 'Fast Delivery',
            description: 'Quick delivery across India with secure packaging',
            icon: 'truck'
          },
          {
            title: 'Best Prices',
            description: 'Competitive pricing without compromising on quality',
            icon: 'tag'
          }
        ]
      },
      order: 3,
    },
  });

  // Create testimonials
  const testimonials = [
    {
      name: 'Rajesh Kumar',
      role: 'Homeowner',
      company: 'Mumbai',
      content: 'Excellent quality solar panels and batteries. The installation was smooth and I\'m saving thousands on my electricity bills.',
      rating: 5,
      order: 1,
    },
    {
      name: 'Priya Sharma',
      role: 'Business Owner',
      company: 'Bangalore',
      content: 'Green Energy Solutions provided the perfect backup power system for our office. Reliable and cost-effective!',
      rating: 5,
      order: 2,
    },
    {
      name: 'Amit Patel',
      role: 'Farmer',
      company: 'Gujarat',
      content: 'The solar water pump system has transformed our farming. Great products and excellent customer service.',
      rating: 4,
      order: 3,
    },
  ];

  for (const testimonialData of testimonials) {
    await prisma.testimonial.create({
      data: testimonialData,
    });
  }

  // Create site settings
  const settings = [
    {
      key: 'site_name',
      value: 'Green Energy Solutions',
      description: 'Site name',
    },
    {
      key: 'site_description',
      value: 'Your trusted partner for sustainable energy solutions in India',
      description: 'Site description',
    },
    {
      key: 'contact_email',
      value: 'info@greenenergysolutions.in',
      description: 'Contact email',
    },
    {
      key: 'contact_phone',
      value: '+91-8010-123-456',
      description: 'Contact phone',
    },
    {
      key: 'shipping_cost',
      value: 50,
      description: 'Standard shipping cost in INR',
    },
    {
      key: 'free_shipping_threshold',
      value: 1000,
      description: 'Free shipping order value threshold in INR',
    },
    {
      key: 'tax_rate',
      value: 0.18,
      description: 'Tax rate (18% GST for India)',
    },
  ];

  for (const settingData of settings) {
    await prisma.setting.upsert({
      where: { key: settingData.key },
      update: settingData,
      create: settingData,
    });
  }

  // Create default site settings with appearance defaults
  const existingSettings = await prisma.siteSettings.findFirst();

  if (!existingSettings) {
    await prisma.siteSettings.create({
      data: {
        headerStyle: 'default',
        footerStyle: 'default',
        menuStyle: 'default',
        maintenanceMode: false,
        siteName: 'Green Energy Solutions',
        siteDescription: 'Leading provider of renewable energy solutions',
        contactEmail: 'info@greenenergysolutions.in',
        contactPhone: '+91 1234567890',
        config: {
          theme: 'light',
          currency: 'INR',
          timezone: 'Asia/Kolkata'
        },
      },
    });
    console.log('Created default site settings');
  } else {
    console.log('Site settings already exist, skipping');
  }

  // Create landing page templates
  const templates = [
    {
      name: 'Modern Eco',
      slug: 'modern-eco',
      description: 'Clean and modern template with gradient effects and smooth animations',
      thumbnail: '/templates/modern-eco.jpg',
      features: ['Hero Section', 'Product Grid', 'Testimonials', 'Newsletter'],
      colorScheme: 'light',
      tags: ['modern', 'clean', 'professional'],
      config: {
        theme: 'modern',
        colors: {
          primary: '#10b981',
          secondary: '#059669',
          accent: '#f59e0b',
        },
      },
      isActive: false,
    },
    {
      name: 'Minimal Green',
      slug: 'minimal-green',
      description: 'Minimalist design focused on content and clarity',
      thumbnail: '/templates/minimal-green.jpg',
      features: ['Clean Layout', 'Typography Focus', 'Fast Loading'],
      colorScheme: 'light',
      tags: ['minimal', 'clean', 'elegant'],
      config: {
        theme: 'minimal',
        colors: {
          primary: '#22c55e',
          secondary: '#16a34a',
          accent: '#84cc16',
        },
      },
      isActive: false,
    },
    {
      name: 'Corporate Pro',
      slug: 'corporate-pro',
      description: 'Professional template for enterprise and B2B businesses',
      thumbnail: '/templates/corporate-pro.jpg',
      features: ['Stats Section', 'Case Studies', 'Team Members', 'Contact Form'],
      colorScheme: 'light',
      tags: ['professional', 'corporate', 'categories'],
      config: {
        theme: 'corporate',
        colors: {
          primary: '#0ea5e9',
          secondary: '#0284c7',
          accent: '#06b6d4',
        },
      },
      isActive: false,
    },
    {
      name: 'Flipkart Style',
      slug: 'flipkart-style',
      description: 'E-commerce focused template with deals, categories, and product grids',
      thumbnail: '/templates/flipkart.jpg',
      features: ['Category Bar', 'Flash Deals', 'Product Grid', 'Trending Section', 'Features Bar'],
      colorScheme: 'light',
      tags: ['e-commerce', 'marketplace', 'categories'],
      config: {
        theme: 'ecommerce',
        colors: {
          primary: '#f59e0b',
          secondary: '#d97706',
          accent: '#dc2626',
        },
      },
      isActive: false,
    },
    {
      name: 'Neomorphic Design',
      slug: 'neomorphic-design',
      description: 'Modern soft UI design with elegant shadows and glassmorphism effects',
      thumbnail: '/templates/neomorphic.jpg',
      features: ['Soft Shadows', 'Glassmorphism', 'Smooth Animations', 'Premium Feel'],
      colorScheme: 'light',
      tags: ['elegant', 'premium', 'glassmorphism'],
      config: {
        theme: 'neomorphic',
        colors: {
          primary: '#10b981',
          secondary: '#059669',
          background: '#e0e5ec',
        },
      },
      isActive: false,
    },
  ];

  for (const template of templates) {
    await prisma.landingTemplate.upsert({
      where: { slug: template.slug },
      update: {},
      create: template,
    });
    console.log(`Created/updated template: ${template.name}`);
  }

  console.log('Database seeded successfully!');

  // Seed knowledge base articles for chat
  console.log('Seeding knowledge base articles...');

  const knowledgeArticles = [
    {
      title: 'How to choose the right solar panel?',
      content: 'When choosing a solar panel, consider: 1) Efficiency rating (higher is better), 2) Warranty period (typically 25 years), 3) Power output (measured in watts), 4) Brand reputation, 5) Your roof space and energy needs. We recommend monocrystalline panels for residential use.',
      keywords: ['solar panel', 'choose', 'select', 'buy', 'monocrystalline', 'efficiency'],
      category: 'Solar Panels',
      isActive: true,
      sortOrder: 1,
    },
    {
      title: 'Solar panel installation process',
      content: 'Our installation process: 1) Site assessment and design, 2) Permits and approvals, 3) Roof preparation, 4) Panel mounting, 5) Electrical connections, 6) System testing, 7) Grid connection. Typical installation takes 1-3 days.',
      keywords: ['installation', 'install', 'setup', 'process', 'how long'],
      category: 'Installation',
      isActive: true,
      sortOrder: 2,
    },
    {
      title: 'Solar battery storage options',
      content: 'We offer lithium-ion batteries with capacities from 5kWh to 20kWh. Benefits include: backup power during outages, reduced electricity bills, energy independence. Battery systems typically last 10-15 years.',
      keywords: ['battery', 'storage', 'backup', 'power', 'lithium'],
      category: 'Batteries',
      isActive: true,
      sortOrder: 3,
    },
    {
      title: 'Warranty and maintenance',
      content: 'All our solar panels come with 25-year performance warranty and 10-year product warranty. Maintenance includes: annual inspection, cleaning (twice a year), inverter check. We offer AMC packages for hassle-free maintenance.',
      keywords: ['warranty', 'maintenance', 'cleaning', 'service', 'amc'],
      category: 'Support',
      isActive: true,
      sortOrder: 4,
    },
    {
      title: 'Government subsidies and incentives',
      content: 'Current government subsidies: 40% for systems up to 3kW, 20% for 3-10kW. Additional state subsidies may apply. We assist with all subsidy paperwork. ROI typically achieved in 5-7 years.',
      keywords: ['subsidy', 'incentive', 'government', 'discount', 'roi'],
      category: 'Finance',
      isActive: true,
      sortOrder: 5,
    },
    {
      title: 'Return and refund policy',
      content: 'We offer 30-day money-back guarantee if you are not satisfied. Products can be returned in original condition. Installation charges are non-refundable. Full refund processed within 7-10 business days.',
      keywords: ['return', 'refund', 'money back', 'cancel'],
      category: 'Policy',
      isActive: true,
      sortOrder: 6,
    },
  ];

  for (const article of knowledgeArticles) {
    await prisma.chatKnowledgeBase.create({
      data: article,
    });
  }

  console.log('Knowledge base articles seeded!');

  // Seed chat departments
  console.log('Seeding chat departments...');

  const departments = [
    {
      name: 'General Support',
      slug: 'general',
      description: 'General inquiries and support',
      email: 'support@greenenergysolutions.in',
      isActive: true,
      sortOrder: 1,
    },
    {
      name: 'Sales',
      slug: 'sales',
      description: 'Product inquiries and quotations',
      email: 'sales@greenenergysolutions.in',
      isActive: true,
      sortOrder: 2,
    },
    {
      name: 'Technical Support',
      slug: 'technical',
      description: 'Installation and technical assistance',
      email: 'tech@greenenergysolutions.in',
      isActive: true,
      sortOrder: 3,
    },
    {
      name: 'Billing & Finance',
      slug: 'finance',
      description: 'Payment and billing inquiries',
      email: 'finance@greenenergysolutions.in',
      isActive: true,
      sortOrder: 4,
    },
  ];

  for (const dept of departments) {
    await prisma.chatDepartment.create({
      data: dept,
    });
  }

  console.log('Chat departments seeded!');

  console.log('\n=== ADMIN CREDENTIALS FOR TESTING ===');
  console.log('🔑 Super Admin:');
  console.log('   Email: admin@greenenergysolutions.in');
  console.log('   Password: admin123');
  console.log('\n🔑 Content Manager:');
  console.log('   Email: content@greenenergysolutions.in');
  console.log('   Password: content123');
  console.log('\n🔑 Order Manager:');
  console.log('   Email: orders@greenenergysolutions.in');
  console.log('   Password: orders123');
  console.log('\n🔑 Finance Manager:');
  console.log('   Email: finance@greenenergysolutions.in');
  console.log('   Password: finance123');
  console.log('\n🔑 Test Customer:');
  console.log('   Email: customer@test.com');
  console.log('   Password: customer123');
  console.log('=====================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });