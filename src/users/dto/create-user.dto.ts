import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty({ example: 'VanLauLam' })
    @IsString()
    username: string;

    @ApiProperty({ example: 'vanlaulam@example.com' })
    @IsEmail()
    email: string;

    @ApiProperty({ example: 'password123', minLength: 8 })
    @IsString()
    @MinLength(8)
    password: string;
}