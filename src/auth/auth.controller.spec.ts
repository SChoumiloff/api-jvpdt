import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService, Tokens } from './auth.service';
import { HttpCode, HttpStatus } from '@nestjs/common';
import { AuthDto } from 'libs/common/src/dto/auth/auth.dto';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            login: jest.fn(),
            register: jest.fn(),
            logout: jest.fn(),
            refreshTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return tokens', async () => {
      const dto: AuthDto = {
        email: 'j.doe@j.com',
        password: 'UzI1NiJ9.eyJSb2xlIj/',
      };
      const result: Tokens = {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2Nob3VtaWxvZmZAaWNsb3VkLmNvbSIsImZpcnN0bmFtZSI6IlNhY2hhIiwibGFzdG5hbWUiOiJDaG91bWlsb2ZmIiwiaWF0IjoxNzA4MTkwNjg3LCJleHAiOjE3MDgzNjM0ODd9.JwJHqOtSstWKBwrhqsGtcJYA_r-wsggisCuoYeiiSsM',
        refresh_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2Nob3VtaWxvZmZAaWNsb3VkLmNvbSIsImlhdCI6MTcwODE5MDY4NywiZXhwIjoxNzEwNzgyNjg3fQ.xWW3A7PJFvSsnz_W77Jhm2iGPqk5BfH7Zb4hRQmofoQ',
      };
      jest.spyOn(authService, 'login').mockImplementation(async () => result);

      expect(await controller.login(dto)).toBe(result);
    });
  });

  describe('register', () => {
    it('should create a user and return tokens', async () => {
      const dto: CreateUserDto = {
        confirmPassword: 'UzI1NiJ9.eyJSb2xlIj/',
        password: 'UzI1NiJ9.eyJSb2xlIj/',
        firstname: 'John',
        lastname: 'Doe',
        email: 'j.doe@j.com',
      };
      const result: Tokens = {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2Nob3VtaWxvZmZAaWNsb3VkLmNvbSIsImZpcnN0bmFtZSI6IlNhY2hhIiwibGFzdG5hbWUiOiJDaG91bWlsb2ZmIiwiaWF0IjoxNzA4MTkwNjg3LCJleHAiOjE3MDgzNjM0ODd9.JwJHqOtSstWKBwrhqsGtcJYA_r-wsggisCuoYeiiSsM',
        refresh_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2Nob3VtaWxvZmZAaWNsb3VkLmNvbSIsImlhdCI6MTcwODE5MDY4NywiZXhwIjoxNzEwNzgyNjg3fQ.xWW3A7PJFvSsnz_W77Jhm2iGPqk5BfH7Zb4hRQmofoQ',
      };
      jest
        .spyOn(authService, 'register')
        .mockImplementation(async () => result);

      expect(await controller.register(dto)).toBe(result);
    });
  });

  describe('logout', () => {
    it('should successfully logout the user', async () => {
      const userId = 1;
      jest
        .spyOn(authService, 'logout')
        .mockImplementation(async () => undefined);

      expect(await controller.logout(userId)).toBeUndefined();
    });
  });

  describe('refreshTokens', () => {
    it('should refresh tokens', async () => {
      const refreshToken =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2Nob3VtaWxvZmZAaWNsb3VkLmNvbSIsImlhdCI6MTcwODE5MDY4NywiZXhwIjoxNzEwNzgyNjg3fQ.xWW3A7PJFvSsnz_W77Jhm2iGPqk5BfH7Zb4hRQmofoQ';
      const userId = 1;
      const result: Tokens = {
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2Nob3VtaWxvZmZAaWNsb3VkLmNvbSIsImZpcnN0bmFtZSI6IlNhY2hhIiwibGFzdG5hbWUiOiJDaG91bWlsb2ZmIiwiaWF0IjoxNzA4MTkwNjg3LCJleHAiOjE3MDgzNjM0ODd9.JwJHqOtSstWKBwrhqsGtcJYA_r-wsggisCuoYeiiSsM',
        refresh_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoic2Nob3VtaWxvZmZAaWNsb3VkLmNvbSIsImlhdCI6MTcwODE5MDY4NywiZXhwIjoxNzEwNzgyNjg3fQ.xWW3A7PJFvSsnz_W77Jhm2iGPqk5BfH7Zb4hRQmofoQ',
      };
      jest
        .spyOn(authService, 'refreshTokens')
        .mockImplementation(async () => result);

      expect(await controller.refreshTokens(refreshToken, userId)).toBe(result);
    });
  });

  describe('me', () => {
    it('should return user data', async () => {
      const mockUser: User = {
        id: 1,
        firstname: 'John',
        lastname: 'Doe',
        isActive: true,
        email: 'john.doe@example.com',
        password: 'hashedpassword',
        passwordResetToken: null,
        passwordResetExpires: null,
        refreshToken: 'mockRefreshToken',
        createdAt: new Date('2021-01-01T00:00:00.000Z'),
        updatedAt: new Date('2021-01-01T00:00:00.000Z'),
        hashPassword: function (): Promise<void> {
          throw new Error('Function not implemented.');
        },
        validatePassword: function (password: string): Promise<boolean> {
          throw new Error('Function not implemented.');
        },
        hashRefreshToken: function (): Promise<void> {
          throw new Error('Function not implemented.');
        },
        validateRefreshToken: function (
          refreshToken: string,
        ): Promise<boolean> {
          throw new Error('Function not implemented.');
        },
      };
      const request = {
        user: mockUser,
      };

      expect(await controller.me(request as any)).toBe(mockUser);
    });
  });
});
