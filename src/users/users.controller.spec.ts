import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UserRole } from './entities/user.entity';

const mockUser = {
  id: 'user-1',
  username: 'VanLauLam',
  email: 'vanlaulam@example.com',
  role: UserRole.USER,
};

const mockReq = { user: { id: 'user-1', role: UserRole.USER } } as any;

const mockUsersService = {
  update: jest.fn(),
  findById: jest.fn(),
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: mockUsersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('me', () => {
    it('should return current user profile', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.me(mockReq);

      expect(mockUsersService.findById).toHaveBeenCalledWith(mockReq.user.id);
      expect(result).toEqual(mockUser);
    });
  });

  describe('findOne', () => {
    it('should return user if same user', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-1', mockReq);
      expect(result).toEqual(mockUser);
    });

    it('should return 403 if bob tries to get alice profile', async () => {
      const bobReq = { user: { id: 'user-2', role: UserRole.USER } } as any;
      await expect(controller.findOne('user-1', bobReq)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should return 404 if user not found', async () => {
      const adminReq = { user: { id: 'admin-1', role: UserRole.ADMIN } } as any;
      mockUsersService.findById.mockResolvedValue(null);
      await expect(controller.findOne('unknown', adminReq)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update user', async () => {
      mockUsersService.update.mockResolvedValue({
        ...mockUser,
        username: 'Updated',
      });

      const result = await controller.update(
        'user-1',
        { username: 'Updated' },
        mockReq,
      );

      expect(mockUsersService.update).toHaveBeenCalledWith(
        'user-1',
        { username: 'Updated' },
        mockReq.user,
      );
      expect(result.username).toBe('Updated');
    });
  });
});
