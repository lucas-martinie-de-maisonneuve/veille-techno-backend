import { reorder } from './position.helper';
import { Repository } from 'typeorm';

const mockRepository = {
  save: jest.fn(),
} as unknown as Repository<any>;

describe('PositionHelper', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('reorder', () => {
    it('should shift items up when moving to a lower position', async () => {
      const items = [
        { id: '1', position: 0 },
        { id: '2', position: 1 },
        { id: '3', position: 2 },
      ];

      await reorder(mockRepository, items, '3', 0, 2);

      expect(items[0].position).toBe(1);
      expect(items[1].position).toBe(2);
    });

    it('should shift items down when moving to a higher position', async () => {
      const items = [
        { id: '1', position: 0 },
        { id: '2', position: 1 },
        { id: '3', position: 2 },
      ];

      await reorder(mockRepository, items, '1', 2, 0);

      expect(items[1].position).toBe(0);
      expect(items[2].position).toBe(1);
    });

    it('should not modify the target item', async () => {
      const items = [
        { id: '1', position: 0 },
        { id: '2', position: 1 },
      ];

      await reorder(mockRepository, items, '1', 1, 0);

      expect(items[0].position).toBe(0);
    });
  });
});
