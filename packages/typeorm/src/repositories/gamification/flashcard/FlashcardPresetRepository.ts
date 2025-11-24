import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike } from "typeorm";
import { FlashcardPresetEntity } from "../../../entities/gamification/flashcard/FlashcardPresetEntity";

export class FlashcardPresetRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<FlashcardPresetEntity>> {
    return await this.database.open(FlashcardPresetEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<FlashcardPresetEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<FlashcardPresetEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply preset name search if q parameter is provided
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

  public async findOne(id: string): Promise<FlashcardPresetEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<FlashcardPresetEntity>): Promise<FlashcardPresetEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: FlashcardPresetEntity, options?: SaveOptions): Promise<FlashcardPresetEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: FlashcardPresetEntity[], options?: SaveOptions): Promise<FlashcardPresetEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: FlashcardPresetEntity, options?: SaveOptions): Promise<FlashcardPresetEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: FlashcardPresetEntity[], options?: SaveOptions): Promise<FlashcardPresetEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<FlashcardPresetEntity> | FindOptionsWhere<FlashcardPresetEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<FlashcardPresetEntity> | FindOptionsWhere<FlashcardPresetEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count({ where: criteria });
  }
}
