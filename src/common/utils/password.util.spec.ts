import { hashPassword, comparePassword } from './password.util';
import { ConfigService } from '@nestjs/config';

const mockConfigService = {
  get: jest.fn().mockReturnValue('mock_pepper'),
} as unknown as ConfigService;

describe('PasswordUtil', () => {
  describe('hashPassword', () => {
    it('should return a hashed string different from the original', async () => {
      const hash = await hashPassword('password123', mockConfigService);
      expect(hash).not.toBe('password123');
      expect(typeof hash).toBe('string');
    });

    it('should produce different hashes for the same password', async () => {
      const hash1 = await hashPassword('password123', mockConfigService);
      const hash2 = await hashPassword('password123', mockConfigService);
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('comparePassword', () => {
    it('should return true for correct password', async () => {
      const hash = await hashPassword('password123', mockConfigService);
      const result = await comparePassword(
        'password123',
        hash,
        mockConfigService,
      );
      expect(result).toBe(true);
    });

    it('should return false for wrong password', async () => {
      const hash = await hashPassword('password123', mockConfigService);
      const result = await comparePassword(
        'wrongpassword',
        hash,
        mockConfigService,
      );
      expect(result).toBe(false);
    });
  });
});
