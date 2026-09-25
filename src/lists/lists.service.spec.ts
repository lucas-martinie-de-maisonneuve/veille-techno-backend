import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ListsService } from './lists.service';
import { List } from './entities/list.entity';
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

const mockListRepository = {
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

describe('ListsService', () => {
  let service: ListsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListsService,
        { provide: getRepositoryToken(List), useValue: mockListRepository },
      ],
    }).compile();

    service = module.get<ListsService>(ListsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a list with auto position', async () => {
      mockListRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      });
      mockListRepository.create.mockReturnValue(mockList);
      mockListRepository.save.mockResolvedValue(mockList);

      const result = await service.create({ title: 'Todo' }, mockOwner as any);
      expect(result).toEqual(mockList);
    });

    it('should shift existing lists when position is explicitly set', async () => {
      mockListRepository.createQueryBuilder.mockReturnValue({
        where: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(2),
      });
      mockListRepository.find.mockResolvedValue([
        { id: 'list-2', position: 0 },
        { id: 'list-3', position: 1 },
      ]);
      mockListRepository.save.mockResolvedValue(mockList);
      mockListRepository.create.mockReturnValue(mockList);

      await service.create({ title: 'New', position: 0 }, mockOwner as any);
      expect(mockListRepository.find).toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all lists of owner', async () => {
      mockListRepository.find.mockResolvedValue([mockList]);
      const result = await service.findAll(mockOwner as any);
      expect(result).toEqual([mockList]);
    });
  });

  describe('findOne', () => {
    it('should return a list if owner', async () => {
      mockListRepository.findOne.mockResolvedValue(mockList);
      const result = await service.findOne('list-1', mockOwner);
      expect(result).toEqual(mockList);
    });

    it('should throw NotFoundException if list not found', async () => {
      mockListRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('unknown', mockOwner)).rejects.toThrow(
        new NotFoundException(ErrorMessages.lists.NOT_FOUND),
      );
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockListRepository.findOne.mockResolvedValue(mockList);
      await expect(service.findOne('list-1', mockOtherUser)).rejects.toThrow(
        new ForbiddenException(ErrorMessages.lists.FORBIDDEN),
      );
    });

    it('should allow admin to access any list', async () => {
      mockListRepository.findOne.mockResolvedValue(mockList);
      const result = await service.findOne('list-1', mockAdmin);
      expect(result).toEqual(mockList);
    });
  });

  describe('remove', () => {
    it('should remove a list', async () => {
      mockListRepository.findOne.mockResolvedValue(mockList);
      mockListRepository.remove.mockResolvedValue(undefined);

      await service.remove('list-1', mockOwner);
      expect(mockListRepository.remove).toHaveBeenCalled();
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockListRepository.findOne.mockResolvedValue(mockList);
      await expect(service.remove('list-1', mockOtherUser)).rejects.toThrow(
        new ForbiddenException(ErrorMessages.lists.FORBIDDEN),
      );
    });

    it('should throw NotFoundException if list not found', async () => {
      mockListRepository.findOne.mockResolvedValue(null);
      await expect(service.remove('unknown', mockOwner)).rejects.toThrow(
        new NotFoundException(ErrorMessages.lists.NOT_FOUND),
      );
    });
  });

  describe('update', () => {
    it('should update a list', async () => {
      mockListRepository.findOne.mockResolvedValue({ ...mockList });
      mockListRepository.save.mockResolvedValue({
        ...mockList,
        title: 'Updated',
      });

      const result = await service.update(
        'list-1',
        { title: 'Updated' },
        mockOwner,
      );
      expect(result.title).toBe('Updated');
    });

    it('should throw ForbiddenException if not owner', async () => {
      mockListRepository.findOne.mockResolvedValue(mockList);
      await expect(
        service.update('list-1', { title: 'Updated' }, mockOtherUser),
      ).rejects.toThrow(new ForbiddenException(ErrorMessages.lists.FORBIDDEN));
    });

    it('should reorder lists when position changes', async () => {
      mockListRepository.findOne.mockResolvedValue({
        ...mockList,
        position: 2,
      });
      mockListRepository.find.mockResolvedValue([
        { id: 'list-2', position: 0 },
        { id: 'list-3', position: 1 },
      ]);
      mockListRepository.save.mockResolvedValue({ ...mockList, position: 0 });

      await service.update('list-1', { position: 0 }, mockOwner);
      expect(mockListRepository.find).toHaveBeenCalled();
    });
  });
});
