/**
 * Seed Script - Create First Admin User
 * 
 * Run with: node prisma/seed.js
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create Prisma client
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🌱 Starting seed...\n');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists:');
        console.log(`   Email: ${existingAdmin.email}`);
        console.log(`   Name: ${existingAdmin.name}`);
        console.log('\n💡 If you forgot the password, use forgot-password endpoint or run this script with --force');

        // Check for --force flag
        if (process.argv.includes('--force')) {
            console.log('\n⚠️  Force flag detected. Creating new admin...');
        } else {
            await prisma.$disconnect();
            return;
        }
    }

    // Create admin user
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@storcktours.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin123!';
    const adminName = process.env.ADMIN_NAME || 'System Admin';

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {
            passwordHash,
            role: 'ADMIN',
            name: adminName,
        },
        create: {
            name: adminName,
            email: adminEmail,
            passwordHash,
            role: 'ADMIN',
            isActive: true,
        },
    });

    console.log('✅ Admin user created successfully!\n');
    console.log('📧 Admin Credentials:');
    console.log('   ─────────────────────────────');
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   ─────────────────────────────');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!\n');

    // Create a sample support user
    const supportEmail = 'support@storcktours.com';
    const supportPassword = 'Support123!';
    const supportHash = await bcrypt.hash(supportPassword, salt);

    await prisma.user.upsert({
        where: { email: supportEmail },
        update: {},
        create: {
            name: 'Support Agent',
            email: supportEmail,
            passwordHash: supportHash,
            role: 'SUPPORT',
            isActive: true,
        },
    });

    console.log('✅ Support user created:');
    console.log(`   Email:    ${supportEmail}`);
    console.log(`   Password: ${supportPassword}\n`);

    // Create a sample regular user
    const userEmail = 'user@example.com';
    const userPassword = 'User1234!';
    const userHash = await bcrypt.hash(userPassword, salt);

    await prisma.user.upsert({
        where: { email: userEmail },
        update: {},
        create: {
            name: 'Test User',
            email: userEmail,
            passwordHash: userHash,
            role: 'USER',
            isActive: true,
        },
    });

    console.log('✅ Test user created:');
    console.log(`   Email:    ${userEmail}`);
    console.log(`   Password: ${userPassword}\n`);

    console.log('🎉 Seed completed successfully!\n');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
