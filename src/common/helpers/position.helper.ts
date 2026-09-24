import { Repository } from 'typeorm';

interface Positionable {
  id: string;
  position: number;
}

export async function reorder<T extends Positionable>(
  repository: Repository<T>,
  items: T[],
  targetId: string,
  newPosition: number,
  oldPosition: number,
): Promise<void> {
  for (const item of items) {
    if (item.id === targetId) continue;

    if (newPosition < oldPosition) {
      if (item.position >= newPosition && item.position < oldPosition) {
        item.position += 1;
        await repository.save(item);
      }
    } else {
      if (item.position > oldPosition && item.position <= newPosition) {
        item.position -= 1;
        await repository.save(item);
      }
    }
  }
}
