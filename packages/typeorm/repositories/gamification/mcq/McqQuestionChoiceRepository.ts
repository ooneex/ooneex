import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { McqQuestionChoiceEntity } from "../../../entities/gamification/mcq/McqQuestionChoiceEntity";

export class McqQuestionChoiceRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<McqQuestionChoiceEntity>> {
    return await this.database.open(McqQuestionChoiceEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<McqQuestionChoiceEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<McqQuestionChoiceEntity>> {
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

  public async findOne(id: string): Promise<McqQuestionChoiceEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<McqQuestionChoiceEntity>): Promise<McqQuestionChoiceEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async findByQuestion(questionId: string): Promise<McqQuestionChoiceEntity[]> {
    const repository = await this.open();

    return await repository.find({
      where: { question: { id: questionId } },
      order: { letter: "ASC" },
    });
  }

  public async findCorrectChoicesByQuestion(questionId: string): Promise<McqQuestionChoiceEntity[]> {
    const repository = await this.open();

    return await repository.find({
      where: {
        question: { id: questionId },
        isCorrect: true,
      },
      order: { letter: "ASC" },
    });
  }

  public async create(entity: McqQuestionChoiceEntity, options?: SaveOptions): Promise<McqQuestionChoiceEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: McqQuestionChoiceEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionChoiceEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: McqQuestionChoiceEntity, options?: SaveOptions): Promise<McqQuestionChoiceEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: McqQuestionChoiceEntity[],
    options?: SaveOptions,
  ): Promise<McqQuestionChoiceEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<McqQuestionChoiceEntity> | FindOptionsWhere<McqQuestionChoiceEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<McqQuestionChoiceEntity> | FindOptionsWhere<McqQuestionChoiceEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
