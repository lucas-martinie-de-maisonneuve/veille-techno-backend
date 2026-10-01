import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import { ApiOkResponse, ApiSecurity, ApiServiceUnavailableResponse, ApiTags } from '@nestjs/swagger';
import { UseGuards } from '@nestjs/common';
import { HealthApiKeyGuard } from './health-api-key.guard';
import { Public } from '@/auth/decorators/public.decorator';


@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  @ApiSecurity('x-api-key')
  @UseGuards(HealthApiKeyGuard)
  @ApiOkResponse({ description: 'API and database are up' })
  @ApiServiceUnavailableResponse({ description: 'API or database is down' })
  check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}