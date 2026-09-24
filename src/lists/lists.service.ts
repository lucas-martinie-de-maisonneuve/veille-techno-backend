import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { List } from './entities/list.entity';
import { CreateListDto } from './dto/create-list.dto';
import { User } from '@/users/entities/user.entity';

@Injectable()
export class ListsService {
  constructor(
    @InjectRepository(List)
    private readonly listRepository: Repository<List>,
  ) {}

  async create(dto: CreateListDto, owner: User): Promise<List> {
    const list = this.listRepository.create({ ...dto, owner });
    return this.listRepository.save(list);
  }

  async findAll(owner: User): Promise<List[]> {
    return this.listRepository.find({
      where: { owner: { id: owner.id } },
      order: { position: 'ASC' },
    });
  }
}