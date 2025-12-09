import path from 'node:path';
import { defineConfig } from 'prisma/config';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:123456@localhost:5432/tour_db?schema=public';

export default defineConfig({
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),

    migrate: {
        async resolveAdapter() {
            const { PrismaPg } = await import('@prisma/adapter-pg');
            const { Pool } = await import('pg');
            const pool = new Pool({ connectionString: databaseUrl });
            return new PrismaPg(pool);
        },
    },

    // Datasource for migrations
    datasource: {
        url: databaseUrl,
    },
});
