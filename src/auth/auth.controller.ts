import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';

/**
 * AuthController handles authentication-related HTTP requests, including user registration.
 * It defines endpoints for user registration and delegates the actual registration logic to the AuthService.
 * The controller uses decorators to specify the HTTP methods, routes, and response status codes for each endpoint.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }
}