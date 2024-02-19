import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOneBy: jest.fn(),
  remove: jest.fn(),
});

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
  validateRefreshToken: function (refreshToken: string): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
};

const updatedMock: User = {
  id: 1,
  firstname: 'Johnny',
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
  validateRefreshToken: function (refreshToken: string): Promise<boolean> {
    throw new Error('Function not implemented.');
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let userRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    it('should successfully insert a user', async () => {
      const userDto: CreateUserDto = {
        firstname: 'John',
        lastname: 'Doe',
        email: 'john@example.com',
        password: '[q!IZV14*~jq(EioyjB',
        confirmPassword: '[q!IZV14*~jq(EioyjB',
      };
      userRepository.create.mockReturnValue(userDto);
      userRepository.save.mockResolvedValue(userDto);

      expect(await service.create(userDto)).toEqual(userDto);
      expect(userRepository.create).toHaveBeenCalledWith(userDto);
      expect(userRepository.save).toHaveBeenCalledWith(userDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      userRepository.find.mockResolvedValue(['user1', 'user2']);

      expect(await service.findAll()).toEqual(['user1', 'user2']);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single user', async () => {
      const user = { id: 1, firstname: 'John' };
      userRepository.findOneBy.mockResolvedValue(user);

      expect(await service.findOne(1)).toEqual(user);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('update', () => {
    it('should update a user', async () => {
      const user = mockUser;
      const updatedUser = updatedMock;
      userRepository.findOneBy.mockResolvedValue(user);
      userRepository.save.mockResolvedValue(updatedUser);

      expect(
        await service.update(1, { firstname: 'Johnny' } as UpdateUserDto),
      ).toEqual(updatedUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: 1 });
      expect(userRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove the user', async () => {
      const user = { id: 1, firstname: 'John', lastname: 'Den' };
      userRepository.findOneBy.mockResolvedValue(user);
      userRepository.remove.mockResolvedValue(user);

      await service.remove(1);
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });
  });
});
