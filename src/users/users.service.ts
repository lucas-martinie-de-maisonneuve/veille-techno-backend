import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { hashPassword } from '@/common/utils/password.util';
import { ErrorMessages } from '@/common/constants/error-messages';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async create(data: CreateUserDto): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: [{ email: data.email }, { username: data.username }],
    });
    if (existing) {
      throw new ConflictException(ErrorMessages.auth.EMAIL_OR_USERNAME_TAKEN);
    }
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async findOneByRole(role: UserRole): Promise<User | null> {
    return this.userRepository.findOne({ where: { role } });
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    requestingUser: { id: string; role: UserRole },
  ): Promise<User> {
    const user = await this.findById(id);

    if (!user) {
      throw new NotFoundException(ErrorMessages.users.NOT_FOUND);
    }

    if (requestingUser.role !== UserRole.ADMIN && requestingUser.id !== id) {
      throw new ForbiddenException(ErrorMessages.users.FORBIDDEN_PROFILE);
    }

    if (dto.role && requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(ErrorMessages.users.FORBIDDEN_ROLE);
    }

    if (dto.password) {
      dto.password = await hashPassword(dto.password, this.configService);
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }
}
