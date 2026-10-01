import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const expectedKey = this.config.get<string>('HEALTH_API_KEY');

    if (!apiKey || apiKey !== expectedKey) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
