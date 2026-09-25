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
};

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    jest.clearAllMocks();
  });

  describe('update', () => {
    it('should update user', async () => {
      mockUsersService.update.mockResolvedValue({ ...mockUser, username: 'Updated' });

      const result = await controller.update('user-1', { username: 'Updated' }, mockReq);

      expect(mockUsersService.update).toHaveBeenCalledWith('user-1', { username: 'Updated' }, mockReq.user);
      expect(result.username).toBe('Updated');
    });
  });
});