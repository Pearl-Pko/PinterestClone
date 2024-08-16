import { PrismaClient } from "@prisma/client";
import { PostgreSqlContainer, StartedPostgreSqlContainer } from "@testcontainers/postgresql";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);
let prisma: PrismaClient;
let container: StartedPostgreSqlContainer;

// initialize test container
beforeAll(async () => {
    container = await new PostgreSqlContainer()
        .withDatabase('test_db')
        .withUsername('test_user')
        .withPassword('test_pass')
        .start();

    const databaseUrl = container.getConnectionUri();

    await execAsync(`npx prisma migrate deploy`, {
        env: { ...process.env, DATABASE_URL: databaseUrl },
    });

    prisma = new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });

   
});

// clear the db after each test
afterEach(async () => {
    const tableNames = await prisma.$queryRaw<Array<{ tablename: string }>>`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname='public'
            `;

    // Truncate each table
    for (const { tablename } of tableNames) {
        if (tablename !== '_prisma_migrations') {
            await prisma.$executeRawUnsafe(
                `TRUNCATE TABLE "public"."${tablename}" RESTART IDENTITY CASCADE;`,
            );
        }
    }
});

//cleanup
afterAll(async () => {
    await prisma.$disconnect();
    await container.stop();
});

export {prisma}
