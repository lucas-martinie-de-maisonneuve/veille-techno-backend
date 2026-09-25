import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@/users/entities/user.entity';

const mockConfigService = {
  get: jest.fn().mockReturnValue('mock_secret'),
} as unknown as ConfigService;

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  beforeEach(() => {
    strategy = new JwtStrategy(mockConfigService);
  });

  it('should validate and return user payload', async () => {
    const payload = {
      sub: 'uuid-1',
      email: 'vanlaulam@example.com',
      role: UserRole.USER,
    };

    const result = await strategy.validate(payload);

    expect(result).toEqual({
      id: 'uuid-1',
      email: 'vanlaulam@example.com',
      role: UserRole.USER,
    });
  });
});