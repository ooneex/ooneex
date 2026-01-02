import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { FlashcardScheduleEntity } from "../../../entities/gamification/flashcard/FlashcardScheduleEntity";

@decorator.repository()
export class FlashcardScheduleRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<FlashcardScheduleEntity>> {
    return await this.database.open(FlashcardScheduleEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<FlashcardScheduleEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<FlashcardScheduleEntity>> {
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

  public async findOne(id: string): Promise<FlashcardScheduleEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<FlashcardScheduleEntity>): Promise<FlashcardScheduleEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: FlashcardScheduleEntity, options?: SaveOptions): Promise<FlashcardScheduleEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: FlashcardScheduleEntity[],
    options?: SaveOptions,
  ): Promise<FlashcardScheduleEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: FlashcardScheduleEntity, options?: SaveOptions): Promise<FlashcardScheduleEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: FlashcardScheduleEntity[],
    options?: SaveOptions,
  ): Promise<FlashcardScheduleEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<FlashcardScheduleEntity> | FindOptionsWhere<FlashcardScheduleEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<FlashcardScheduleEntity> | FindOptionsWhere<FlashcardScheduleEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
