import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { Prisma, Post as PostEntity } from '@prisma/client';
import { AuthorNotFoundException } from '@server/common/exceptions/exceptions';
import { CreatePostDto } from './dto/create-post.dto';
import { DatabaseService } from '@server/modules/database/database.service';
import { NotFoundException } from '@nestjs/common';

describe('PostsService', () => {
    let service: PostsService;
    let databaseService: DatabaseService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostsService,
                {
                    provide: DatabaseService,
                    useValue: {
                        post: {
                            create: jest.fn(), 
                            update: jest.fn()// Mock the `create` method
                        },
                    },
                },
            ],
        }).compile();

        service = module.get<PostsService>(PostsService);
        databaseService = module.get<DatabaseService>(DatabaseService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should successfully create a post', async () => {
            const createPostDto: CreatePostDto = {
                title: 'Test Post',
                author_id: 'author-id-1',
                image_url: 'https://example.com/image.jpg',
            };

            const postEntity: PostEntity = {
                id: 'post-id-1',
                title: 'Test Post',
                author_id: '0313bcd5-46cc-4d33-8295-c9ce9cae85bc',
                image_url: 'https://example.com/image.jpg',
                external_link: 'dsew',
                description: 'going',
                tags: 'dew',
                created_at: new Date(),
                updated_at: new Date(),
                // ... other properties
            };

            jest.spyOn(databaseService.post, 'create').mockResolvedValue(
                postEntity,
            );

            const result = await service.create(createPostDto);
            expect(result).toEqual(postEntity);
            // expect(databaseService.post.create).toHaveBeenCalledWith({
            //     data: createPostDto,
            // });
        });

        it('should throw AuthorNotFoundException if Prisma error code P2025 is encountered', async () => {
            const createPostDto: CreatePostDto = {
                title: 'Test Post',
                author_id: 'non-existing-author-id',
                image_url: 'https://example.com/image.jpg',
                // ... other properties
            };

            const prismaError = new Prisma.PrismaClientKnownRequestError(
                'Error Message',
                { code: 'P2025', clientVersion: '1' },
            );

            jest.spyOn(databaseService.post, 'create').mockRejectedValue(
                prismaError,
            );

            await expect(service.create(createPostDto)).rejects.toThrow(
                AuthorNotFoundException,
            );
            // expect(databaseService.post.create).toHaveBeenCalledWith({
            //     data: createPostDto,
            // });
        });
    });
    describe('update', () => {
        const mockId = '90232';
        const mockUpdateData = { title: 'Updated Title' };

        it('should successfully update a post', async () => {
            const mockUpdatedPost: PostEntity = {
                id: mockId,
                title: 'Updated Title',
                author_id: '0313bcd5-46cc-4d33-8295-c9ce9cae85bc',
                image_url: 'https://example.com/image.jpg',
                external_link: 'dsew',
                description: 'going',
                tags: 'dew',
                created_at: new Date(),
                updated_at: new Date(),
                // ... other properties
            };
            jest.spyOn(databaseService.post, 'update').mockResolvedValue(
                mockUpdatedPost,
            );

            const result = await service.update(mockId, mockUpdateData);

            expect(result).toEqual(mockUpdatedPost);
            expect(databaseService.post.update).toHaveBeenCalledWith({
                where: { id: mockId },
                data: mockUpdateData,
            });
        });

        it('should throw NotFoundException when post is not found', async () => {
            const mockError = new Prisma.PrismaClientKnownRequestError('', {
                code: 'P2025',
                clientVersion: '2.0.0',
            });
            jest.spyOn(databaseService.post, 'update').mockRejectedValue(
                mockError,
            );

            await expect(
                service.update(mockId, mockUpdateData),
            ).rejects.toThrow(NotFoundException);
            expect(databaseService.post.update).toHaveBeenCalledWith({
                where: { id: mockId },
                data: mockUpdateData,
            });
        });
    });
});
