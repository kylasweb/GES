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

  console.log('Database seeded successfully!');
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