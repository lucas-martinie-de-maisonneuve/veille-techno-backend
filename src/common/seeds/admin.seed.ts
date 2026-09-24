import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { UsersService } from '@/users/users.service';
import { ConfigService } from '@nestjs/config';
import { UserRole } from '@/users/entities/user.entity';
import { hashPassword } from '@/common/utils/password.util';

@Injectable()
export class AdminSeed implements OnApplicationBootstrap {
    private readonly logger = new Logger(AdminSeed.name);

    constructor(
        private readonly usersService: UsersService,
        private readonly configService: ConfigService,
    ) { }

    async onApplicationBootstrap() {
        const existingAdmin = await this.usersService.findOneByRole(UserRole.ADMIN);

        if (existingAdmin) {
            this.logger.log('Admin already exists, skipping seed');
            return;
        }

        const email = this.configService.get<string>('ADMIN_EMAIL');
        const password = this.configService.get<string>('ADMIN_PASSWORD');
        const username = this.configService.get<string>('ADMIN_USERNAME');

        if (!email || !password || !username) {
            this.logger.error(
                '\n' +
                '═══════════════════════════════════════════════════════════\n' +
                'WARNING: No admin account found in the database! This may cause issues with admin-restricted routes.\n' +
                'To create an admin account, add the following variables to your .env file:\n' +
                'ADMIN_EMAIL=admin@example.com / ADMIN_PASSWORD=yourpassword / ADMIN_USERNAME=admin\n' +
                'Once the admin account is created, these variables can be removed from your .env file.\n\n' +
                'Restart the application after adding the variables.\n' +
                '═══════════════════════════════════════════════════════════\n',
            );
            return;
        }

        const hashedPassword = await hashPassword(password, this.configService);

        await this.usersService.create({
            username,
            email,
            password: hashedPassword,
            role: UserRole.ADMIN,
        });

        this.logger.log(`Admin account created: ${email}`);
    }
}