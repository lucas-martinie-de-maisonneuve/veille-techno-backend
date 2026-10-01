import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { HealthApiKeyGuard } from './health-api-key.guard';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [HealthApiKeyGuard],
})
export class HealthModule {}
