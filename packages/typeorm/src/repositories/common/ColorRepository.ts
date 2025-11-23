import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ColorEntity } from "../../entities/common/ColorEntity";

export class ColorRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<ColorEntity>> {
    return await this.database.open(ColorEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<ColorEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<ColorEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    const result = await repository.find({ ...rest, skip, take });

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

  public async findOne(id: string): Promise<ColorEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<ColorEntity>): Promise<ColorEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: ColorEntity, options?: SaveOptions): Promise<ColorEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: ColorEntity[], options?: SaveOptions): Promise<ColorEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: ColorEntity, options?: SaveOptions): Promise<ColorEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: ColorEntity[], options?: SaveOptions): Promise<ColorEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<ColorEntity> | FindOptionsWhere<ColorEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(criteria?: FindOptionsWhere<ColorEntity> | FindOptionsWhere<ColorEntity>[]): Promise<number> {
    const repository = await this.open();

    return await repository.count({ where: criteria });
  }
}
