import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { User } from '@/users/entities/user.entity';
import { UpdateListDto } from './dto/update-list.dto';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@/users/entities/user.entity';
import { ErrorMessages } from '@/common/constants/error-messages';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) { }

  async create(dto: CreateListDto, owner: User): Promise<List> {
    const list = this.listRepository.create({ ...dto, owner });
    return this.listRepository.save(list);
  }

  async remove(id: string, requestingUser: { id: string; role: UserRole }): Promise<void> {
    const list = await this.listRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!list) {
      throw new NotFoundException(ErrorMessages.lists.NOT_FOUND);
    }

    if (list.owner.id !== requestingUser.id && requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(ErrorMessages.lists.FORBIDDEN);
    }

    await this.listRepository.remove(list);
  }

  async update(id: string, dto: UpdateListDto, requestingUser: { id: string; role: UserRole }): Promise<List> {
    const list = await this.listRepository.findOne({
      where: { id },
      relations: { owner: true },
    });

    if (!list) throw new NotFoundException(ErrorMessages.lists.NOT_FOUND);
    if (list.owner.id !== requestingUser.id && requestingUser.role !== UserRole.ADMIN) {
      throw new ForbiddenException(ErrorMessages.lists.FORBIDDEN);
    }

    if (dto.position !== undefined && dto.position !== list.position) {
      const allLists = await this.listRepository.find({
        where: { owner: { id: requestingUser.id } },
        order: { position: 'ASC' },
      });

      const oldPosition = list.position;
      const newPosition = dto.position;

      for (const l of allLists) {
        if (l.id === id) continue;

        if (newPosition < oldPosition) {
          if (l.position >= newPosition && l.position < oldPosition) {
            l.position += 1;
            await this.listRepository.save(l);
          }
        } else {
          if (l.position > oldPosition && l.position <= newPosition) {
            l.position -= 1;
            await this.listRepository.save(l);
          }
        }
      }
    }

    Object.assign(list, dto);
    return this.listRepository.save(list);
  }

  async findAll(owner: User): Promise<List[]> {
    return this.listRepository.find({
      where: { owner: { id: owner.id } },
      order: { position: 'ASC' },
    });
  }
}