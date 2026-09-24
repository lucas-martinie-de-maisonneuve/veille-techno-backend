import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user',
}

@Entity('users')
export class User {
    @ApiProperty()
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ApiProperty({ example: 'VanLauLam' })
    @Column({ unique: true })
    username: string;

    @ApiProperty({ example: 'vanlaulam@example.com' })
    @Column({ unique: true })
    email: string;

    @Exclude()
    @Column()
    password: string;

    @ApiProperty({ enum: UserRole, example: UserRole.USER })
    @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
}
