import { Test, TestingModule } from '@nestjs/testing';
import { Post as PostEntity, User as UserEntity } from '@prisma/client';
import { DatabaseService } from '@server/modules/database/database.service';
import request from 'supertest';
import { CreatePostDto } from '@server/modules/posts/dto/create-post.dto';
import { HttpStatus, INestApplication } from '@nestjs/common';
import { AppModule } from '@server/app.module';
import { MockPost, MockUserDto, MockUserEntity } from '../src/fixtures';
import { app, prisma } from './setup/setupTests.e2e';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('Posts', () => {
    let accessToken: string;

    beforeEach(async () => {
        const signupResponse = await request(app.getHttpServer())
            .post('/auth/signup')
            .send(MockUserDto)
            .expect(HttpStatus.OK);

        const { access_token } = signupResponse.body;
        accessToken = access_token;
    });

    describe('create', () => {
        it('should successfully create a post', async () => {
            let response = await request(app.getHttpServer())
                .post('/posts')
                .send(MockPost)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(201);

            expect(response.body).toMatchObject(MockPost);

            // Verify the post exists in the database
            const createdPost = await prisma.post.findUnique({
                where: { id: response.body.id },
            });

            // Assert: Check that the post was actually created in the database
            expect(createdPost).toMatchObject(MockPost);
        });

        it('should throw AuthorNotFoundException if the user does not exist', async () => {
            const jwtService = app.get(JwtService);
            const configService = app.get(ConfigService);

            const randomUserToken = jwtService.sign(
                { sub: 'random-id' },
                { secret: configService.get<string>('JWT_ACCESS_SECRET') },
            );

            const response = await request(app.getHttpServer())
                .post('/posts')
                .send(MockPost)
                .set('Authorization', `Bearer ${randomUserToken}`)
                .expect(HttpStatus.NOT_FOUND);
        });
    });

    describe('update', () => {
        it('should successfully update a post', async () => {
            const newPostResponse = await request(app.getHttpServer())
                .post('/posts')
                .send(MockPost)
                .set('Authorization', `Bearer ${accessToken}`);
            const newPost = newPostResponse.body as PostEntity;

              const updateData = {
                title: 'Updated Test Post',
            };

            const response = await request(app.getHttpServer())
                .patch(`/posts/${newPost.id}`) // Adjust the endpoint as needed
                .send(updateData)
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(200);

            expect((response.body as PostEntity).title).toMatch(updateData.title);

            const updatedPost = await prisma.post.findUnique({
                where: { id: newPost.id },
            });
            expect(updatedPost?.title).toMatch(updateData.title);
        });

        it('should throw NotFoundException when post does not exist', async () => {
            const response = await request(app.getHttpServer())
                .patch(`/posts/3232KL32`)
                .send({title: "new post"})
                .set('Authorization', `Bearer ${accessToken}`)
                .expect(404);
        });
    });
});
