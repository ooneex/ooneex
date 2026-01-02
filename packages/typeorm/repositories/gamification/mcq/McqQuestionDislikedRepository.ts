import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { McqQuestionDislikedEntity } from "../../../entities/gamification/mcq/McqQuestionDislikedEntity";

@decorator.repository()
export class McqQuestionDislikedRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<McqQuestionDislikedEntity>> {
    return await this.database.open(McqQuestionDislikedEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<McqQuestionDislikedEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<McqQuestionDislikedEntity>> {
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

  public async findOne(id: string): Promise<McqQuestionDislikedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(
    criteria: FindOptionsWhere<McqQuestionDislikedEntity>,
  ): Promise<McqQuestionDislikedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: McqQuestionDislikedEntity, options?: SaveOptions): Promise<McqQuestionDislikedEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: McqQuestionDislikedEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionDislikedEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: McqQuestionDislikedEntity, options?: SaveOptions): Promise<McqQuestionDislikedEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: McqQuestionDislikedEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionDislikedEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<McqQuestionDislikedEntity> | FindOptionsWhere<McqQuestionDislikedEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<McqQuestionDislikedEntity> | FindOptionsWhere<McqQuestionDislikedEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
