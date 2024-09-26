import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { MockUserDto, MockUserEntity } from '@server/fixtures';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SessionService } from '../session/session.service';
import { DatabaseService } from '../database/database.service';
import { UserAlreadyExists, UserWithEmailNotFoundException } from '@server/common/exceptions/exceptions';
import { NotFoundException } from '@nestjs/common';

describe('AuthService', () => {
    let authService: AuthService;
    let userService: UsersService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: {
                        findUser: jest.fn(),
                        create: jest.fn(),
                    },
                },
                JwtService,
                ConfigService,
                SessionService,
                DatabaseService,
            ],
        }).compile();

        authService = module.get<AuthService>(AuthService);
        userService = module.get<UsersService>(UsersService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(authService).toBeDefined();
    });

    describe('Sign In', () => {
        it('Should successfully sign in a user with valid credentials', async () => {
            const returnData = {
                access_token: 'access-token',
                refresh_token: 'refresh-token',
            };
            jest.spyOn(userService, 'findUser').mockResolvedValue(
                MockUserEntity,
            );
            jest.spyOn(authService, 'compareHash').mockResolvedValue(true);

            jest.spyOn(authService, 'createUserSession').mockResolvedValue(
                returnData,
            );

            const result = await authService.signIn(MockUserDto);
            expect(result).toEqual(returnData);

            expect(userService.findUser).toHaveBeenCalledWith({
                email: MockUserDto.email,
            });
            expect(authService.compareHash).toHaveBeenCalledWith(
                MockUserDto.password,
                MockUserEntity.password,
            );
            expect(authService.createUserSession).toHaveBeenCalledWith(
                MockUserEntity,
            );
        });

        it('Should throw UserNotFoundException if user is not found', async () => {
            jest.spyOn(userService, 'findUser').mockResolvedValue(null);
            await expect(authService.signIn(MockUserDto)).rejects.toThrow(
                UserWithEmailNotFoundException,
            );

            expect(userService.findUser).toHaveBeenCalledWith({
                email: MockUserDto.email,
            });
        });

        it('should throw NotFoundException if password is incorrect', async () => {
            jest.spyOn(userService, 'findUser').mockResolvedValue(
                MockUserEntity,
            );
            jest.spyOn(authService, 'compareHash').mockResolvedValue(false);

            await expect(authService.signIn(MockUserDto)).rejects.toThrow(
                NotFoundException,
            );
            expect(authService.compareHash).toHaveBeenCalledWith(
                MockUserDto.password,
                MockUserEntity.password,
            );
        });
    });

    describe('Sign Up', () => {
        it('Should successfully sign up new user', async () => {
            jest.spyOn(userService, 'findUser').mockResolvedValue(null);
            jest.spyOn(authService, 'hashData').mockResolvedValue(
                'hashed-password',
            );

            const newUser = {
                ...MockUserEntity,
                password: 'hashed-password',
            };

            jest.spyOn(userService, 'create').mockResolvedValue(newUser);

            jest.spyOn(authService, 'createUserSession').mockResolvedValue({
                access_token: 'access-token',
                refresh_token: 'refresh-token',
            });

            const result = await authService.signUp(MockUserDto);

            expect(result).toEqual({
                access_token: 'access-token',
                refresh_token: 'refresh-token',
            });

            expect(userService.findUser).toHaveBeenCalledWith({
                email: MockUserDto.email,
            });
            expect(authService.hashData).toHaveBeenCalledWith(
                MockUserDto.password,
            );
            expect(userService.create).toHaveBeenCalledWith({
                email: MockUserDto.email,
                password: 'hashed-password',
            });
            expect(authService.createUserSession).toHaveBeenCalledWith(newUser);
        });

        it('should throw UserAlreadyExists if email is already taken', async () => {
          
            jest.spyOn(userService, "findUser").mockResolvedValue(MockUserEntity);
          
            await expect(authService.signUp(MockUserDto)).rejects.toThrow(UserAlreadyExists);
            expect(userService.findUser).toHaveBeenCalledWith({ email: MockUserDto.email });
          });
    });
});
