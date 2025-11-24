import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { FlashcardStatsEntity } from "../../../entities/gamification/flashcard/FlashcardStatsEntity";

export class FlashcardStatsRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<FlashcardStatsEntity>> {
    return await this.database.open(FlashcardStatsEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<FlashcardStatsEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<FlashcardStatsEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    const findOptions = { ...rest, skip, take };
    const result = await repository.find(findOptions);

    const total = await this.count(rest.where);
    const totalPages = Math.ceil(total / limit);

    return {
      resources: result,
      total,
      totalPages,
      page,
      limit,
    };
  }

  public async findOne(id: string): Promise<FlashcardStatsEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<FlashcardStatsEntity>): Promise<FlashcardStatsEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: FlashcardStatsEntity, options?: SaveOptions): Promise<FlashcardStatsEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: FlashcardStatsEntity[], options?: SaveOptions): Promise<FlashcardStatsEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: FlashcardStatsEntity, options?: SaveOptions): Promise<FlashcardStatsEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: FlashcardStatsEntity[], options?: SaveOptions): Promise<FlashcardStatsEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<FlashcardStatsEntity> | FindOptionsWhere<FlashcardStatsEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<FlashcardStatsEntity> | FindOptionsWhere<FlashcardStatsEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count({ where: criteria });
  }
}
