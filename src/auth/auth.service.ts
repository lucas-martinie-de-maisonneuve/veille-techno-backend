import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UsersService } from '@/users/users.service';
import { User } from '@/users/entities/user.entity';

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
        const hashedPassword = await bcrypt.hash(dto.password + pepper, 10);

        const user = await this.usersService.create({
            username: dto.username,
            email: dto.email,
            password: hashedPassword,
        });

        const { password, ...result } = user;
        return result;
    }

    async login(dto: LoginDto): Promise<{ accesstoken: string }> {
        const pepper = this.configService.get<string>('PEPPER');
        const user = await this.usersService.findByEmail(dto.email);

        if (user) {
            const isMatch = await bcrypt.compare(dto.password + pepper, user.password);
        }

        if (!user || !(await bcrypt.compare(dto.password + pepper, user.password))) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = { sub: user.id, email: user.email, role: user.role };
        return { accesstoken: this.jwtService.sign(payload) };
    }
}