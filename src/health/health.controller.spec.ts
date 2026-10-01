import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { HealthApiKeyGuard } from './health-api-key.guard';

const mockHealthCheckService = {
    check: jest.fn(),
};

const mockTypeOrmHealthIndicator = {
    pingCheck: jest.fn(),
};

describe('HealthController', () => {
    let controller: HealthController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [HealthController],
            providers: [
                { provide: HealthCheckService, useValue: mockHealthCheckService },
                { provide: TypeOrmHealthIndicator, useValue: mockTypeOrmHealthIndicator },
                {
                    provide: HealthApiKeyGuard,
                    useValue: { canActivate: jest.fn().mockReturnValue(true) },
                },
            ],
        })
            .overrideGuard(HealthApiKeyGuard)
            .useValue({ canActivate: jest.fn().mockReturnValue(true) })
            .compile();

        controller = module.get<HealthController>(HealthController);
        jest.clearAllMocks();
    });

    describe('check', () => {
        it('should return health status when database is up', async () => {
            const mockResult = {
                status: 'ok',
                info: { database: { status: 'up' } },
                error: {},
                details: { database: { status: 'up' } },
            };
            mockHealthCheckService.check.mockResolvedValue(mockResult);

            const result = await controller.check();
            expect(result).toEqual(mockResult);
            expect(mockHealthCheckService.check).toHaveBeenCalled();
        });

        it('should throw when database is down', async () => {
            mockHealthCheckService.check.mockRejectedValue(new Error('DB down'));
            await expect(controller.check()).rejects.toThrow('DB down');
        });
    });
});