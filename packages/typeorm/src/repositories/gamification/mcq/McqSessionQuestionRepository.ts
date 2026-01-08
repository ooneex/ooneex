import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike } from "typeorm";
import { McqSessionQuestionEntity } from "../../../entities/gamification/mcq/McqSessionQuestionEntity";

@decorator.repository()
export class McqSessionQuestionRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<McqSessionQuestionEntity>> {
    return await this.database.open(McqSessionQuestionEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<McqSessionQuestionEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<McqSessionQuestionEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply question text search if q parameter is provided
    let findOptions = { ...rest, take, ...(skip !== undefined && { skip }) };
    if (q) {
      findOptions = {
        ...findOptions,
        where: {
          ...rest.where,
          question: {
            text: ILike(`%${q}%`),
          },
        },
      };
    }

    const result = await repository.find(findOptions);

    // Apply the same where conditions for count including question text search
    let countWhere = rest.where;
    if (q) {
      countWhere = {
        ...rest.where,
        question: {
          text: ILike(`%${q}%`),
        },
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

  public async findOne(id: string): Promise<McqSessionQuestionEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(
    criteria: FindOptionsWhere<McqSessionQuestionEntity>,
  ): Promise<McqSessionQuestionEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: McqSessionQuestionEntity, options?: SaveOptions): Promise<McqSessionQuestionEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: McqSessionQuestionEntity[],
    options?: SaveOptions,
  ): Promise<McqSessionQuestionEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: McqSessionQuestionEntity, options?: SaveOptions): Promise<McqSessionQuestionEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: McqSessionQuestionEntity[],
    options?: SaveOptions,
  ): Promise<McqSessionQuestionEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<McqSessionQuestionEntity> | FindOptionsWhere<McqSessionQuestionEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<McqSessionQuestionEntity> | FindOptionsWhere<McqSessionQuestionEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
