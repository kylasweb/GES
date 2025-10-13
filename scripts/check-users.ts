import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function checkUsers() {
    console.log('Checking users in database...\n');

    try {
        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                isActive: true,
                password: true, // Include to verify it exists
            }
        });

        console.log(`Found ${users.length} users:\n`);

        for (const user of users) {
            console.log(`Email: ${user.email}`);
            console.log(`Name: ${user.name}`);
            console.log(`Role: ${user.role}`);
            console.log(`Active: ${user.isActive}`);
            console.log(`Has Password: ${user.password ? 'Yes' : 'No'}`);
            console.log(`Password Hash: ${user.password.substring(0, 20)}...`);

            // Test password verification
            if (user.email === 'admin@greenenergysolutions.in') {
                const isValid = await bcrypt.compare('admin123', user.password);
                console.log(`Password 'admin123' valid: ${isValid ? '✅ YES' : '❌ NO'}`);
            }

            console.log('---\n');
        }

    } catch (error) {
        console.error('Error checking users:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUsers();
