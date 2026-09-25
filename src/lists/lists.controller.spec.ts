import { Test, TestingModule } from '@nestjs/testing';
import { ListsController } from './lists.controller';
import { ListsService } from './lists.service';
import { UserRole } from '@/users/entities/user.entity';

const mockUser = { id: 'user-1', role: UserRole.USER };
const mockReq = { user: mockUser } as any;

const mockList = {
  id: 'list-1',
  title: 'Todo',
  position: 0,
};

const mockListsService = {
  create: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('ListsController', () => {
  let controller: ListsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ListsController],
      providers: [
        { provide: ListsService, useValue: mockListsService },
      ],
    }).compile();

    controller = module.get<ListsController>(ListsController);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a list', async () => {
      mockListsService.create.mockResolvedValue(mockList);
      const result = await controller.create({ title: 'Todo' }, mockReq);
      expect(mockListsService.create).toHaveBeenCalledWith({ title: 'Todo' }, mockUser);
      expect(result).toEqual(mockList);
    });
  });

  describe('findAll', () => {
    it('should return all lists', async () => {
      mockListsService.findAll.mockResolvedValue([mockList]);
      const result = await controller.findAll(mockReq);
      expect(result).toEqual([mockList]);
    });
  });

  describe('update', () => {
    it('should update a list', async () => {
      mockListsService.update.mockResolvedValue({ ...mockList, title: 'Updated' });
      const result = await controller.update('list-1', { title: 'Updated' }, mockReq);
      expect(mockListsService.update).toHaveBeenCalledWith('list-1', { title: 'Updated' }, mockUser);
      expect(result.title).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should remove a list', async () => {
      mockListsService.remove.mockResolvedValue(undefined);
      await controller.remove('list-1', mockReq);
      expect(mockListsService.remove).toHaveBeenCalledWith('list-1', mockUser);
    });
  });
});