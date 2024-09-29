import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaClient } from '@prisma/client';
import { AppModule } from '@server/app.module';
import { DatabaseService } from '@server/modules/database/database.service';
import {
    PostgreSqlContainer,
    StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
import { RedisContainer, StartedRedisContainer } from '@testcontainers/redis';
import { exec } from 'child_process';
import mailhog, { MailHog } from 'mailhog';
import { GenericContainer, StartedTestContainer } from 'testcontainers';
import { promisify } from 'util';

const execAsync = promisify(exec);
let prisma: PrismaClient;
let databaseContainer: StartedPostgreSqlContainer;
let redisContainer: StartedRedisContainer;
export let app: INestApplication;
let mailhogContainer: StartedTestContainer;
export let mh: MailHog;

// initialize test container
beforeAll(async () => {
    console.log("enter")

    databaseContainer = await new PostgreSqlContainer()
        .withDatabase('test_db')
        .withUsername('test_user')
        .withPassword('test_pass')
        .start();

    mailhogContainer = await new GenericContainer('mailhog/mailhog')
        .withExposedPorts(1025, 8025)
        .start();

    const smtp_uri = `smtp://@${mailhogContainer.getHost()}:${mailhogContainer.getMappedPort(1025)}`;

    mh = mailhog({
        host: mailhogContainer.getHost(),
        port: mailhogContainer.getMappedPort(8025),
        protocol: 'http:',
        basePath: '/api',
    });
    console.log("how")
    redisContainer = await new RedisContainer().start();

    const redisUrl = redisContainer.getConnectionUrl();

    const databaseUrl = databaseContainer.getConnectionUri();

    process.env.DATABASE_URL = databaseUrl;
    process.env.REDIS_URI = redisUrl;
    process.env.SMTP_URI = smtp_uri;

    await execAsync(`npx prisma migrate deploy`, {
        env: {
            ...process.env,
            DATABASE_URL: databaseUrl,
        },
    });

    prisma = new PrismaClient({
        datasources: {
            db: {
                url: databaseUrl,
            },
        },
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(DatabaseService)
        .useValue(prisma)
        .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
});

// clear the db after each test
afterEach(async () => {
    const tableNames = await prisma.$queryRaw<Array<{ tablename: string }>>`
            SELECT tablename 
            FROM pg_tables 
            WHERE schemaname='public'
            `;

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
    await databaseContainer.stop();
    await app.close();
});

export { prisma };
