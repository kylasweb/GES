import { db as prisma } from '@/lib/db';
import { TemplateRenderer } from '@/components/template-renderer';

async function getActiveTemplate() {
  try {
    const settings = await prisma.siteSettings.findFirst({
      include: { activeTemplate: true }
    });
    
    return settings?.activeTemplate?.slug || 'default';
  } catch (error) {
    console.error('Failed to fetch active template:', error);
    return 'default';
  }
}

async function getLandingData() {
  try {
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
  } catch (error) {
    console.error('Failed to fetch landing data:', error);
    return { categories: [], products: [], deals: [] };
  }
}

export default async function HomePage() {
  const [templateSlug, data] = await Promise.all([
    getActiveTemplate(),
    getLandingData()
  ]);

  return <TemplateRenderer templateSlug={templateSlug} data={data} />;
}