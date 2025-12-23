import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { StatEntity } from "../../entities/common/StatEntity";

export class StatRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<StatEntity>> {
    return await this.database.open(StatEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<StatEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<StatEntity>> {
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

  public async findOne(id: string): Promise<StatEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<StatEntity>): Promise<StatEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: StatEntity, options?: SaveOptions): Promise<StatEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: StatEntity[], options?: SaveOptions): Promise<StatEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: StatEntity, options?: SaveOptions): Promise<StatEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: StatEntity[], options?: SaveOptions): Promise<StatEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(criteria: FindOptionsWhere<StatEntity> | FindOptionsWhere<StatEntity>[]): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(criteria?: FindOptionsWhere<StatEntity> | FindOptionsWhere<StatEntity>[]): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
