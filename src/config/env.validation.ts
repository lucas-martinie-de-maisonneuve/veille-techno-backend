import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  @IsNotEmpty()
  DB_USERNAME: string;

  @IsString()
  @IsNotEmpty()
  DB_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  DB_NAME: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsNumber()
  PORT: number;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  const colors = {
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    bold: '\x1b[1m',
    reset: '\x1b[0m',
  };

  if (errors.length > 0) {
    throw new Error(
      `${colors.bold}${colors.red}Missing or invalid environment variables:${colors.reset}\n${colors.yellow}${errors
        .map((e) => `  - ${Object.values(e.constraints ?? {}).join(', ')}`)
        .join('\n')}${colors.reset}`
    );
  }

  return validatedConfig;
}