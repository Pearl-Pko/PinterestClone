import { Test, TestingModule } from '@nestjs/testing';
import {
    Post as PostEntity,
    User as UserEntity,
} from '@prisma/client';
import { DatabaseService } from '@server/modules/database/database.service';
import * as request from 'supertest';
import { CreatePostDto } from '@server/modules/posts/dto/create-post.dto';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '@server/app.module';
import { POST, USER } from '../src/fixtures';
import { prisma } from './setup/setupTests.e2e';

describe('Posts', () => {
    let app: INestApplication;

    beforeAll(async () => {

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideProvider(DatabaseService)
            .useValue(prisma)
            .compile();
        app = moduleFixture.createNestApplication();
        await app.init();
    })

    afterAll(async () => {
        await app.close();
    })

    describe('create', () => {
        it('should successfully create a post', async () => {
            const user = await prisma.user.create({
                data: USER,
            });

            const createPostDto: CreatePostDto = {
                ...POST,
                author_id: user.id,
            };

            let response = await request(app.getHttpServer())
                .post('/posts') 
                .send(createPostDto)
                .expect(201);

            expect(response.body).toMatchObject(createPostDto);

            // Verify the post exists in the database
            const createdPost = await prisma.post.findUnique({
                where: { id: response.body.id }, 
            });

            // Assert: Check that the post was actually created in the database
            expect(createdPost).toMatchObject(createPostDto);
        });

        it('should throw AuthorNotFoundException if the user does not exist', async () => {
            const response = await request(app.getHttpServer())
                .post('/posts')
                .send({...POST, author_id: "jkljJHJKke"})
                .expect(404);
        });
    });

    describe('update', () => {

        it('should successfully update a post', async () => {
            let user: UserEntity = await prisma.user.create({
                data: USER,
            });

            let post: PostEntity = await prisma.post.create({
                data: {
                    ...POST, author_id: user.id
                },
            });

            const updateData = {
                ...POST, title: "Updated Test Post", id: post.id, author_id: user.id
            };

            const response = await request(app.getHttpServer())
                .patch(`/posts/${post.id}`) // Adjust the endpoint as needed
                .send(updateData)
                .expect(200);

            expect(response.body).toMatchObject(updateData);

            const updatedPost = await prisma.post.findUnique({
                where: { id: post.id },
            });
            expect(updatedPost).toMatchObject(updateData);
        });

        it('should throw NotFoundException when post does not exist', async () => {

            const response = await request(app.getHttpServer())
                .patch(`/posts/3232KL32`) 
                .send(POST)
                .expect(404);
            
        });
    });
});
