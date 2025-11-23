import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike } from "typeorm";
import { CategoryEntity } from "../../entities/common/CategoryEntity";

export class CategoryRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<CategoryEntity>> {
    return await this.database.open(CategoryEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<CategoryEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<CategoryEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply category name search if q parameter is provided
    let findOptions = { ...rest, skip, take };
    if (q) {
      findOptions = {
        ...findOptions,
        where: {
          ...rest.where,
          name: ILike(`%${q}%`),
        },
      };
    }

    const result = await repository.find(findOptions);

    // Apply the same where conditions for count including name search
    let countWhere = rest.where;
    if (q) {
      countWhere = {
        ...rest.where,
        name: ILike(`%${q}%`),
      };
    }

    const total = await this.count(countWhere);
    const totalPages = Math.ceil(total / limit);

    return {
      resources: result,
      total,
      totalPages,
      page,
      limit,
    };
  }

  public async findOne(id: string): Promise<CategoryEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<CategoryEntity>): Promise<CategoryEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: CategoryEntity, options?: SaveOptions): Promise<CategoryEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: CategoryEntity[], options?: SaveOptions): Promise<CategoryEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: CategoryEntity, options?: SaveOptions): Promise<CategoryEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: CategoryEntity[], options?: SaveOptions): Promise<CategoryEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<CategoryEntity> | FindOptionsWhere<CategoryEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<CategoryEntity> | FindOptionsWhere<CategoryEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count({ where: criteria });
  }
}
