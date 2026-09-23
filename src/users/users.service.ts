import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

/**
 * Service responsible for managing user-related operations,
 * including creating users and retrieving users by email or ID.
 */
@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) { }

    /**
     * Creates a new user in the database after checking for existing users with the same email or username.
     * If a user with the same email or username already exists, a ConflictException is thrown.
     * @param data
     * @returns
     */
    async create(data: Partial<User>): Promise<User> {
        const existing = await this.userRepository.findOne({
            where: [
                { email: data.email },
                { username: data.username }
            ],
        });

        if (existing) {
            throw new ConflictException('Email or username already in use');
        }

        const user = this.userRepository.create(data);
        return this.userRepository.save(user);
    }

    /**
     * Finds a user by their email address.
     * @param email The email address of the user to find.
     * @returns A Promise that resolves to the User entity if found, or null if not found.
     */
    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    /**
     * Finds a user by their unique identifier (ID).
     * @param id The unique identifier of the user to find.
     * @returns A Promise that resolves to the User entity if found, or null if not found.
     */
    async findById(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }
}