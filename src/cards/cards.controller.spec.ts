import { Test, TestingModule } from '@nestjs/testing';
import { CardsController } from './cards.controller';
import { CardsService } from './cards.service';
import { UserRole } from '@/users/entities/user.entity';

const mockUser = { id: 'user-1', role: UserRole.USER };
const mockReq = { user: mockUser } as any;

const mockCard = {
  id: 'card-1',
  title: 'Fix login bug',
  description: 'The login button does not work on mobile',
  position: 0,
};

const mockCardsService = {
  create: jest.fn(),
  findAllByList: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CardsController', () => {
  let controller: CardsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CardsController],
      providers: [
        { provide: CardsService, useValue: mockCardsService },
      ],
    }).compile();

    controller = module.get<CardsController>(CardsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a card', async () => {
      mockCardsService.create.mockResolvedValue(mockCard);
      const dto = { title: 'Fix login bug' };

      const result = await controller.create('list-1', dto, mockReq);

      expect(mockCardsService.create).toHaveBeenCalledWith('list-1', dto, mockUser);
      expect(result).toEqual(mockCard);
    });
  });

  describe('findAllByList', () => {
    it('should return all cards of a list', async () => {
      mockCardsService.findAllByList.mockResolvedValue([mockCard]);

      const result = await controller.findAllByList('list-1', mockReq);

      expect(mockCardsService.findAllByList).toHaveBeenCalledWith('list-1', mockUser);
      expect(result).toEqual([mockCard]);
    });
  });

  describe('findOne', () => {
    it('should return a card', async () => {
      mockCardsService.findOne.mockResolvedValue(mockCard);

      const result = await controller.findOne('card-1', mockReq);

      expect(mockCardsService.findOne).toHaveBeenCalledWith('card-1', mockUser);
      expect(result).toEqual(mockCard);
    });
  });

  describe('update', () => {
    it('should update a card', async () => {
      mockCardsService.update.mockResolvedValue({ ...mockCard, title: 'Updated' });
      const dto = { title: 'Updated' };

      const result = await controller.update('card-1', dto, mockReq);

      expect(mockCardsService.update).toHaveBeenCalledWith('card-1', dto, mockUser);
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove a card', async () => {
      mockCardsService.remove.mockResolvedValue(undefined);

      await controller.remove('card-1', mockReq);

      expect(mockCardsService.remove).toHaveBeenCalledWith('card-1', mockUser);
    });
  });
});