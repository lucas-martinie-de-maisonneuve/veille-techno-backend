import { Test, TestingModule } from '@nestjs/testing';
import { HealthApiKeyGuard } from './health-api-key.guard';
import { ConfigService } from '@nestjs/config';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

const mockConfigService = {
  get: jest.fn().mockReturnValue('test-api-key'),
};

const mockExecutionContext = (apiKey?: string): ExecutionContext =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: { 'x-api-key': apiKey },
      }),
    }),
  }) as unknown as ExecutionContext;

describe('HealthApiKeyGuard', () => {
  let guard: HealthApiKeyGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthApiKeyGuard,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    guard = module.get<HealthApiKeyGuard>(HealthApiKeyGuard);
    jest.clearAllMocks();
  });

  it('should allow access with valid API key', () => {
    const result = guard.canActivate(mockExecutionContext('test-api-key'));
    expect(result).toBe(true);
  });

  it('should throw UnauthorizedException with invalid API key', () => {
    expect(() => guard.canActivate(mockExecutionContext('wrong-key')))
      .toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException with no API key', () => {
    expect(() => guard.canActivate(mockExecutionContext()))
      .toThrow(UnauthorizedException);
  });
});