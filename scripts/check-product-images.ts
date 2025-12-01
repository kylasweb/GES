import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkProductImages() {
    console.log('Checking product images in database...\n');

    try {
        // Get a few products with their images
        const products = await prisma.product.findMany({
            take: 5,
            select: {
                id: true,
                name: true,
                images: true,
                slug: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        console.log(`Found ${products.length} products:\n`);

        for (const product of products) {
            console.log(`Product: ${product.name}`);
            console.log(`Slug: ${product.slug}`);
            console.log(`ID: ${product.id}`);

            if (Array.isArray(product.images)) {
                console.log(`Images (${product.images.length}):`);
                product.images.forEach((img, index) => {
                    console.log(`  ${index + 1}. ${img}`);
                });
            } else {
                console.log(`Images: ${product.images}`);
            }
            console.log('---');
        }
    } catch (error) {
        console.error('Error checking product images:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkProductImages();