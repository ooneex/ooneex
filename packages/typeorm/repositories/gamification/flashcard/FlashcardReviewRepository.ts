import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { FlashcardReviewEntity } from "../../../entities/gamification/flashcard/FlashcardReviewEntity";

@decorator.repository()
export class FlashcardReviewRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<FlashcardReviewEntity>> {
    return await this.database.open(FlashcardReviewEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<FlashcardReviewEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<FlashcardReviewEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    const findOptions = { ...rest, take, ...(skip !== undefined && { skip }) };
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

  public async findOne(id: string): Promise<FlashcardReviewEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<FlashcardReviewEntity>): Promise<FlashcardReviewEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: FlashcardReviewEntity, options?: SaveOptions): Promise<FlashcardReviewEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: FlashcardReviewEntity[], options?: SaveOptions): Promise<FlashcardReviewEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: FlashcardReviewEntity, options?: SaveOptions): Promise<FlashcardReviewEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: FlashcardReviewEntity[], options?: SaveOptions): Promise<FlashcardReviewEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<FlashcardReviewEntity> | FindOptionsWhere<FlashcardReviewEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<FlashcardReviewEntity> | FindOptionsWhere<FlashcardReviewEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
