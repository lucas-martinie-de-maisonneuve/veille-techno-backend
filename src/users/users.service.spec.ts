import { Test, TestingModule } from '@nestjs/testing';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { UsersService } from './users.service';
import { User, UserRole } from './entities/user.entity';
import { ErrorMessages } from '@/common/constants/error-messages';
import * as passwordUtil from '@/common/utils/password.util';

jest.mock('@/common/utils/password.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password'),
}));

const mockUser = {
  id: 'user-1',
  username: 'VanLauLam',
  email: 'vanlaulam@example.com',
  password: 'hashed_password',
  role: UserRole.USER,
};

const mockAdmin = { id: 'admin-1', role: UserRole.ADMIN };
const mockOwner = { id: 'user-1', role: UserRole.USER };
const mockOtherUser = { id: 'user-2', role: UserRole.USER };

const mockUserRepository = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  }),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('mock_pepper'),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create({
        username: 'VanLauLam',
        email: 'vanlaulam@example.com',
        password: 'hashed_password',
      });

      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException if email/username already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create({
          username: 'VanLauLam',
          email: 'vanlaulam@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(
        new ConflictException(ErrorMessages.auth.EMAIL_OR_USERNAME_TAKEN),
      );
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findById('user-1');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const result = await service.findById('unknown');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update own profile', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        username: 'Updated',
      });

      const result = await service.update(
        'user-1',
        { username: 'Updated' },
        mockOwner,
      );
      expect(result.username).toBe('Updated');
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.update('unknown', { username: 'Updated' }, mockOwner),
      ).rejects.toThrow(new NotFoundException(ErrorMessages.users.NOT_FOUND));
    });

    it('should throw ForbiddenException if not own profile', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.update('user-1', { username: 'Updated' }, mockOtherUser),
      ).rejects.toThrow(
        new ForbiddenException(ErrorMessages.users.FORBIDDEN_PROFILE),
      );
    });

    it('should throw ForbiddenException if non-admin tries to change role', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.update('user-1', { role: UserRole.ADMIN }, mockOwner),
      ).rejects.toThrow(
        new ForbiddenException(ErrorMessages.users.FORBIDDEN_ROLE),
      );
    });

    it('should allow admin to change role', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        role: UserRole.ADMIN,
      });

      const result = await service.update(
        'user-1',
        { role: UserRole.ADMIN },
        mockAdmin,
      );
      expect(result.role).toBe(UserRole.ADMIN);
    });

    it('should hash password if updated', async () => {
      mockUserRepository.findOne.mockResolvedValue({ ...mockUser });
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        password: 'hashed_password',
      });

      await service.update('user-1', { password: 'newpassword' }, mockOwner);
      expect(passwordUtil.hashPassword).toHaveBeenCalled();
    });
  });
});
