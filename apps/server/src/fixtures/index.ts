import { User } from '@prisma/client';
import { CreatePostDto } from '@server/modules/posts/dto/create-post.dto';
import { UpdatePostDto } from '@server/modules/posts/dto/update-post.dto';
import { CreateUserDto } from '@server/modules/users/dto/create-user.dto';

export const MockUserEntity: User = {
    id: '93',
    email: 'ksa@da.com',
    username: 'ksa',
    password: '32,ljk4j3l',
    first_name: null,
    last_name: 'james',
    about: 'I think therefore I am',
    website: 'kew',
    date_of_birth: new Date(),
    gender: 'Male',
    created_at: new Date(),
    updated_at: new Date(),
    country: 'e',
    reset_token: 'kew',
    reset_token_expires_at: new Date(),
};

export const MockUserDto: CreateUserDto = {
    email: 'ksa@da.com',
    password: 'real',
};

export const MockPost: CreatePostDto = {
    title: "dsz",
    image_url: "kelw e"
}

