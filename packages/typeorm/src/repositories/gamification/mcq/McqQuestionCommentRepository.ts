import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { McqQuestionCommentEntity } from "../../../entities/gamification/mcq/McqQuestionCommentEntity";

@decorator.repository()
export class McqQuestionCommentRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<McqQuestionCommentEntity>> {
    return await this.database.open(McqQuestionCommentEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<McqQuestionCommentEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<McqQuestionCommentEntity>> {
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

  public async findOne(id: string): Promise<McqQuestionCommentEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(
    criteria: FindOptionsWhere<McqQuestionCommentEntity>,
  ): Promise<McqQuestionCommentEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: McqQuestionCommentEntity, options?: SaveOptions): Promise<McqQuestionCommentEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: McqQuestionCommentEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionCommentEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: McqQuestionCommentEntity, options?: SaveOptions): Promise<McqQuestionCommentEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: McqQuestionCommentEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionCommentEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<McqQuestionCommentEntity> | FindOptionsWhere<McqQuestionCommentEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<McqQuestionCommentEntity> | FindOptionsWhere<McqQuestionCommentEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
