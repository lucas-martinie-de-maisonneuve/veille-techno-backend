import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';
import { CreateCardDto } from './dto/create-card.dto';
import { UpdateCardDto } from './dto/update-card.dto';
import { ListsService } from '@/lists/lists.service';
import { UserRole } from '@/users/entities/user.entity';
import { ErrorMessages } from '@/common/constants/error-messages';
import { reorder } from '@/common/helpers/position.helper';

type RequestingUser = { id: string; role: UserRole };

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private readonly cardRepository: Repository<Card>,
    private readonly listsService: ListsService,
  ) {}

  async create(
    listId: string,
    dto: CreateCardDto,
    requestingUser: RequestingUser,
  ): Promise<Card> {
    const list = await this.listsService.findOne(listId, requestingUser);

    const count = await this.cardRepository
      .createQueryBuilder('card')
      .where('card.listId = :listId', { listId })
      .getCount();

    const position =
      dto.position !== undefined && dto.position !== null
        ? dto.position
        : count;

    if (dto.position !== undefined && dto.position !== null) {
      const allCards = await this.cardRepository.find({
        where: { list: { id: listId } },
        order: { position: 'ASC' },
      });

      for (const card of allCards) {
        if (card.position >= position) {
          card.position += 1;
          await this.cardRepository.save(card);
        }
      }
    }

    const card = this.cardRepository.create({ ...dto, position, list });
    return this.cardRepository.save(card);
  }

  async findAllByList(
    listId: string,
    requestingUser: RequestingUser,
  ): Promise<Card[]> {
    const list = await this.listsService.findOne(listId, requestingUser);
    return this.cardRepository.find({
      where: { list: { id: list.id } },
      order: { position: 'ASC' },
    });
  }

  async findOne(id: string, requestingUser: RequestingUser): Promise<Card> {
    const card = await this.cardRepository.findOne({
      where: { id },
      relations: { list: { owner: true } },
    });

    if (!card) throw new NotFoundException(ErrorMessages.cards.NOT_FOUND);

    if (
      card.list.owner.id !== requestingUser.id &&
      requestingUser.role !== UserRole.ADMIN
    ) {
      throw new ForbiddenException(ErrorMessages.cards.FORBIDDEN);
    }

    return card;
  }

  async update(
    id: string,
    dto: UpdateCardDto,
    requestingUser: RequestingUser,
  ): Promise<Card> {
    const card = await this.findOne(id, requestingUser);

    if (dto.listId && dto.listId !== card.list.id) {
      const targetList = await this.listsService.findOne(
        dto.listId,
        requestingUser,
      );
      card.list = targetList;
    }

    if (dto.position !== undefined && dto.position !== card.position) {
      const allCards = await this.cardRepository.find({
        where: { list: { id: card.list.id } },
        order: { position: 'ASC' },
      });
      await reorder(
        this.cardRepository,
        allCards,
        id,
        dto.position,
        card.position,
      );
    }

    const { listId: _listId, ...rest } = dto;
    Object.assign(card, rest);
    return this.cardRepository.save(card);
  }

  async remove(id: string, requestingUser: RequestingUser): Promise<void> {
    const card = await this.findOne(id, requestingUser);
    const listId = card.list.id;
    const removedPosition = card.position;

    await this.cardRepository.remove(card);

    const remainingCards = await this.cardRepository.find({
      where: { list: { id: listId } },
      order: { position: 'ASC' },
    });

    for (const c of remainingCards) {
      if (c.position > removedPosition) {
        c.position -= 1;
        await this.cardRepository.save(c);
      }
    }
  }
}
