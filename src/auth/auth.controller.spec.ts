import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRole } from '@/users/entities/user.entity';

const mockUser = {
  id: 'uuid-1',
  username: 'VanLauLam',
  email: 'vanlaulam@example.com',
  role: UserRole.USER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockAuthService.register.mockResolvedValue(mockUser);

      const dto = {
        username: 'VanLauLam',
        email: 'vanlaulam@example.com',
        password: 'password123',
      };

      const result = await controller.register(dto);

      expect(mockAuthService.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return accesstoken on valid credentials', async () => {
      mockAuthService.login.mockResolvedValue({ accesstoken: 'mock_token' });

      const dto = {
        email: 'vanlaulam@example.com',
        password: 'password123',
      };

      const result = await controller.login(dto);

      expect(mockAuthService.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ accesstoken: 'mock_token' });
    });
  });
});