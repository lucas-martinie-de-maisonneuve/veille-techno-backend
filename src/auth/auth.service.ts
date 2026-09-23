import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '@/users/users.service';
import { CreateUserDto } from '@/users/dto/create-user.dto';
import { User } from '@/users/entities/user.entity';
import { hashPassword, comparePassword } from '@/common/utils/password.util';
import { ErrorMessages } from '@/common/constants/error-messages';

/**
 * AuthService is responsible for handling authentication-related operations,
 * including user registration and JWT token generation.
 */
@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    /**
     * Registers a new user by hashing their password and saving their details in the database.
     * @param dto The data transfer object containing user registration details.
     * @returns A Promise that resolves to the newly created user object without the password field.
     */
    async register(dto: CreateUserDto): Promise<User> {
        const hashedPassword = await hashPassword(dto.password, this.configService);

        return this.usersService.create({
            username: dto.username,
            email: dto.email,
            password: hashedPassword,
        });
    }

    async login(dto: LoginDto): Promise<{ accesstoken: string }> {
        const user = await this.usersService.findByEmail(dto.email);

        if (!user || !(await comparePassword(dto.password, user.password, this.configService))) {
            throw new UnauthorizedException(ErrorMessages.auth.INVALID_CREDENTIALS);
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        return { accesstoken: this.jwtService.sign(payload) };
    }
}