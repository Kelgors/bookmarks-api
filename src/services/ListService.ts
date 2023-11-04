import type { FindAllOptions, ICrudService } from '../@types/ICrudService';
import { getRepository } from '../db';
import { List } from '../models/List';
import { Visibility } from '../models/ListVisibility';
import type { ListCreateInputBody, ListUpdateInputBody } from '../schemas/List';

class ListService implements ICrudService<List, ListCreateInputBody, ListUpdateInputBody> {
  findAll(options?: FindAllOptions | undefined): Promise<List[]> {
    const take = Math.min(options?.perPage || 20, 50);
    const skip = ((options?.page || 1) - 1) * take;
    return getRepository(List).find({
      skip,
      take,
      where: [{ visibility: { anonymous: Visibility.SHAREABLE } }, { visibility: { anonymous: Visibility.PUBLIC } }],
    });
  }

  findAllByUserId(userId: string, options?: FindAllOptions | undefined): Promise<List[]> {
    const take = Math.min(options?.perPage || 20, 50);
    const skip = ((options?.page || 1) - 1) * take;
    return getRepository(List).find({
      skip,
      take,
      where: [
        { ownerId: userId },
        { permissions: { userId }, visibility: { instance: Visibility.SHAREABLE } },
        { permissions: { userId }, visibility: { instance: Visibility.PUBLIC } },
      ],
    });
  }

  findOneWithUserId(id: string, userId: string): Promise<List> {
    return getRepository(List).findOneOrFail({
      where: [
        { id, ownerId: userId },
        { id, permissions: { userId }, visibility: { instance: Visibility.SHAREABLE } },
        { id, permissions: { userId }, visibility: { instance: Visibility.PUBLIC } },
        { id, visibility: { anonymous: Visibility.SHAREABLE } },
        { id, visibility: { anonymous: Visibility.PUBLIC } },
      ],
    });
  }

  findOne(id: string): Promise<List> {
    return getRepository(List).findOneOrFail({
      where: [
        { id, visibility: { anonymous: Visibility.SHAREABLE } },
        { id, visibility: { anonymous: Visibility.PUBLIC } },
      ],
    });
  }

  create(input: ListCreateInputBody): Promise<List> {
    const repo = getRepository(List);
    return repo.save(repo.create(input));
  }

  update(dbOriginalList: List, input: ListUpdateInputBody): Promise<List> {
    return getRepository(List).save(Object.assign(dbOriginalList, input));
  }

  delete(item: List): Promise<List> {
    return getRepository(List).remove(item);
  }
}

export const listService = new ListService();
