import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

export async function hashPassword(
  password: string,
  configService: ConfigService,
): Promise<string> {
  const pepper = configService.get<string>('PEPPER');
  return bcrypt.hash(password + pepper, 10);
}

export async function comparePassword(
  password: string,
  hash: string,
  configService: ConfigService,
): Promise<boolean> {
  const pepper = configService.get<string>('PEPPER');
  return bcrypt.compare(password + pepper, hash);
}
