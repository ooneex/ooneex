import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { McqQuestionSavedEntity } from "../../../entities/gamification/mcq/McqQuestionSavedEntity";

@decorator.repository()
export class McqQuestionSavedRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<McqQuestionSavedEntity>> {
    return await this.database.open(McqQuestionSavedEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<McqQuestionSavedEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<McqQuestionSavedEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    const result = await repository.find({ ...rest, take, ...(skip !== undefined && { skip }) });

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

  public async findOne(id: string): Promise<McqQuestionSavedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<McqQuestionSavedEntity>): Promise<McqQuestionSavedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: McqQuestionSavedEntity, options?: SaveOptions): Promise<McqQuestionSavedEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: McqQuestionSavedEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionSavedEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: McqQuestionSavedEntity, options?: SaveOptions): Promise<McqQuestionSavedEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: McqQuestionSavedEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionSavedEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<McqQuestionSavedEntity> | FindOptionsWhere<McqQuestionSavedEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<McqQuestionSavedEntity> | FindOptionsWhere<McqQuestionSavedEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
