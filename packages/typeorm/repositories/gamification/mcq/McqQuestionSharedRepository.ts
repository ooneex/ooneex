import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { McqQuestionSharedEntity } from "../../../entities/gamification/mcq/McqQuestionSharedEntity";

@decorator.repository()
export class McqQuestionSharedRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<McqQuestionSharedEntity>> {
    return await this.database.open(McqQuestionSharedEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<McqQuestionSharedEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<McqQuestionSharedEntity>> {
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

  public async findOne(id: string): Promise<McqQuestionSharedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<McqQuestionSharedEntity>): Promise<McqQuestionSharedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: McqQuestionSharedEntity, options?: SaveOptions): Promise<McqQuestionSharedEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: McqQuestionSharedEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionSharedEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: McqQuestionSharedEntity, options?: SaveOptions): Promise<McqQuestionSharedEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: McqQuestionSharedEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionSharedEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<McqQuestionSharedEntity> | FindOptionsWhere<McqQuestionSharedEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<McqQuestionSharedEntity> | FindOptionsWhere<McqQuestionSharedEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
