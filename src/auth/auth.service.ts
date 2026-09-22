import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/user.entity';

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
    async register(dto: RegisterDto): Promise<Omit<User, 'password'>> {
        const pepper = this.configService.get<string>('PEPPER');
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.usersService.create({
            username: dto.username,
            email: dto.email,
            password: hashedPassword,
        });

        const { password, ...result } = user;
        return result;
    }
}