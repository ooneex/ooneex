import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike } from "typeorm";
import { FlashcardEntity } from "../../../entities/gamification/flashcard/FlashcardEntity";

@decorator.repository()
export class FlashcardRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<FlashcardEntity>> {
    return await this.database.open(FlashcardEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<FlashcardEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<FlashcardEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply front text search if q parameter is provided
    let findOptions = { ...rest, take, ...(skip !== undefined && { skip }) };
    if (q) {
      findOptions = {
        ...findOptions,
        where: {
          ...rest.where,
          front: ILike(`%${q}%`),
        },
      };
    }

    const result = await repository.find(findOptions);

    // Apply the same where conditions for count including front text search
    let countWhere = rest.where;
    if (q) {
      countWhere = {
        ...rest.where,
        front: ILike(`%${q}%`),
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

  public async findOne(id: string): Promise<FlashcardEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<FlashcardEntity>): Promise<FlashcardEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: FlashcardEntity, options?: SaveOptions): Promise<FlashcardEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: FlashcardEntity[], options?: SaveOptions): Promise<FlashcardEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: FlashcardEntity, options?: SaveOptions): Promise<FlashcardEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: FlashcardEntity[], options?: SaveOptions): Promise<FlashcardEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<FlashcardEntity> | FindOptionsWhere<FlashcardEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<FlashcardEntity> | FindOptionsWhere<FlashcardEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
