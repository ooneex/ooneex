import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike } from "typeorm";
import { FlashcardDeckEntity } from "../../../entities/gamification/flashcard/FlashcardDeckEntity";

@decorator.repository()
export class FlashcardDeckRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<FlashcardDeckEntity>> {
    return await this.database.open(FlashcardDeckEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<FlashcardDeckEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<FlashcardDeckEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply deck name search if q parameter is provided
    let findOptions = { ...rest, take, ...(skip !== undefined && { skip }) };
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

  public async findOne(id: string): Promise<FlashcardDeckEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<FlashcardDeckEntity>): Promise<FlashcardDeckEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: FlashcardDeckEntity, options?: SaveOptions): Promise<FlashcardDeckEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: FlashcardDeckEntity[], options?: SaveOptions): Promise<FlashcardDeckEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: FlashcardDeckEntity, options?: SaveOptions): Promise<FlashcardDeckEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: FlashcardDeckEntity[], options?: SaveOptions): Promise<FlashcardDeckEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<FlashcardDeckEntity> | FindOptionsWhere<FlashcardDeckEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<FlashcardDeckEntity> | FindOptionsWhere<FlashcardDeckEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
