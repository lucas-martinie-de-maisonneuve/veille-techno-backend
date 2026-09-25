import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { UsersService } from '@/users/users.service';
import { UserRole } from '@/users/entities/user.entity';
import { ErrorMessages } from '@/common/constants/error-messages';

// Mock the entire module
jest.mock('@/common/utils/password.util', () => ({
  hashPassword: jest.fn().mockResolvedValue('hashed_password'),
  comparePassword: jest.fn().mockResolvedValue(true),
}));

import * as passwordUtil from '@/common/utils/password.util';

const mockUser = {
  id: 'uuid-1',
  username: 'VanLauLam',
  email: 'vanlaulam@example.com',
  password: 'hashed_password',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersService = {
  create: jest.fn(),
  findByEmail: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

const mockConfigService = {
  get: jest.fn().mockReturnValue('mock_pepper'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should hash password and create user', async () => {
      (passwordUtil.hashPassword as jest.Mock).mockResolvedValue('hashed_password');
      mockUsersService.create.mockResolvedValue(mockUser);

      const dto = {
        username: 'VanLauLam',
        email: 'vanlaulam@example.com',
        password: 'password123',
      };

      const result = await service.register(dto);

      expect(passwordUtil.hashPassword).toHaveBeenCalledWith('password123', mockConfigService);
      expect(mockUsersService.create).toHaveBeenCalledWith({
        username: dto.username,
        email: dto.email,
        password: 'hashed_password',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return accesstoken on valid credentials', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(true);

      const dto = { email: 'vanlaulam@example.com', password: 'password123' };
      const result = await service.login(dto);

      expect(result).toEqual({ accesstoken: 'mock_token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@test.com', password: 'password123' }),
      ).rejects.toThrow(new UnauthorizedException(ErrorMessages.auth.INVALID_CREDENTIALS));
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);
      (passwordUtil.comparePassword as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'vanlaulam@example.com', password: 'wrongpassword' }),
      ).rejects.toThrow(new UnauthorizedException(ErrorMessages.auth.INVALID_CREDENTIALS));
    });
  });
});