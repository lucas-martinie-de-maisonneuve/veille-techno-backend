import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CardsService } from './cards.service';
import { Card } from './entities/card.entity';
import { ListsService } from '@/lists/lists.service';
import { UserRole } from '@/users/entities/user.entity';
import { ErrorMessages } from '@/common/constants/error-messages';

const mockOwner = { id: 'user-1', role: UserRole.USER };
const mockAdmin = { id: 'admin-1', role: UserRole.ADMIN };
const mockOtherUser = { id: 'user-2', role: UserRole.USER };

const mockList = {
  id: 'list-1',
  title: 'Todo',
  position: 0,
  owner: { id: 'user-1' },
};

const mockCard = {
  id: 'card-1',
  title: 'Fix login bug',
  description: 'The login button does not work on mobile',
  position: 0,
  list: mockList,
};

const mockCardRepository = {
  createQueryBuilder: jest.fn().mockReturnValue({
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
  }),
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  remove: jest.fn(),
};

const mockListsService = {
  findOne: jest.fn(),
};

describe('CardsService', () => {
  let service: CardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CardsService,
        { provide: getRepositoryToken(Card), useValue: mockCardRepository },
        { provide: ListsService, useValue: mockListsService },
      ],
    }).compile();

    service = module.get<CardsService>(CardsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a card with auto position', async () => {
      mockListsService.findOne.mockResolvedValue(mockList);
      mockCardRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      });
      mockCardRepository.create.mockReturnValue(mockCard);
      mockCardRepository.save.mockResolvedValue(mockCard);

      const dto = { title: 'Fix login bug' };
      const result = await service.create('list-1', dto, mockOwner);

      expect(mockListsService.findOne).toHaveBeenCalledWith('list-1', mockOwner);
      expect(result).toEqual(mockCard);
    });

    it('should shift existing cards when position is explicitly set', async () => {
      mockListsService.findOne.mockResolvedValue(mockList);
      mockCardRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      });
      mockCardRepository.find.mockResolvedValue([
        { id: 'card-2', position: 0 },
        { id: 'card-3', position: 1 },
      ]);
      mockCardRepository.save.mockResolvedValue(mockCard);
      mockCardRepository.create.mockReturnValue(mockCard);

      const dto = { title: 'New card', position: 0 };
      await service.create('list-1', dto, mockOwner);

      expect(mockCardRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAllByList', () => {
    it('should return all cards of a list', async () => {
      mockListsService.findOne.mockResolvedValue(mockList);
      mockCardRepository.find.mockResolvedValue([mockCard]);

      const result = await service.findAllByList('list-1', mockOwner);

      expect(result).toEqual([mockCard]);
    });
  });

  describe('findOne', () => {
    it('should return a card if owner', async () => {
      mockCardRepository.findOne.mockResolvedValue(mockCard);

      const result = await service.findOne('card-1', mockOwner);
      expect(result).toEqual(mockCard);
    });

    it('should throw NotFoundException if card not found', async () => {
      mockCardRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('unknown', mockOwner))
        .rejects.toThrow(new NotFoundException(ErrorMessages.cards.NOT_FOUND));
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockCardRepository.findOne.mockResolvedValue(mockCard);

      await expect(service.findOne('card-1', mockOtherUser))
        .rejects.toThrow(new ForbiddenException(ErrorMessages.cards.FORBIDDEN));
    });

    it('should allow admin to access any card', async () => {
      mockCardRepository.findOne.mockResolvedValue(mockCard);

      const result = await service.findOne('card-1', mockAdmin);
      expect(result).toEqual(mockCard);
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      mockCardRepository.findOne.mockResolvedValue({ ...mockCard });
      mockCardRepository.save.mockResolvedValue({ ...mockCard, title: 'Updated' });

      const result = await service.update('card-1', { title: 'Updated' }, mockOwner);
      expect(result.title).toBe('Updated');
    });

    it('should move card to another list', async () => {
      const cardWithList = { ...mockCard, list: { ...mockList, id: 'list-1' } };
      mockCardRepository.findOne.mockResolvedValue(cardWithList);
      mockListsService.findOne.mockResolvedValue({ ...mockList, id: 'list-2' });
      mockCardRepository.save.mockResolvedValue({ ...cardWithList, list: { id: 'list-2' } });

      const result = await service.update('card-1', { listId: 'list-2' }, mockOwner);
      expect(mockListsService.findOne).toHaveBeenCalledWith('list-2', mockOwner);
    });
  });

  describe('remove', () => {
    it('should remove a card and reorder remaining', async () => {
      mockCardRepository.findOne.mockResolvedValue(mockCard);
      mockCardRepository.remove.mockResolvedValue(undefined);
      mockCardRepository.find.mockResolvedValue([
        { id: 'card-2', position: 1 },
        { id: 'card-3', position: 2 },
      ]);
      mockCardRepository.save.mockResolvedValue(undefined);

      await service.remove('card-1', mockOwner);

      expect(mockCardRepository.remove).toHaveBeenCalled();
      expect(mockCardRepository.find).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockCardRepository.findOne.mockResolvedValue(mockCard);

      await expect(service.remove('card-1', mockOtherUser))
        .rejects.toThrow(new ForbiddenException(ErrorMessages.cards.FORBIDDEN));
    });
  });
});