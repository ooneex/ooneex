import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ImageStatEntity } from "../../entities/image/ImageStatEntity";

@decorator.repository()
export class ImageStatRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<ImageStatEntity>> {
    return await this.database.open(ImageStatEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<ImageStatEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<ImageStatEntity>> {
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

  public async findOne(id: string): Promise<ImageStatEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<ImageStatEntity>): Promise<ImageStatEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: ImageStatEntity, options?: SaveOptions): Promise<ImageStatEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: ImageStatEntity[], options?: SaveOptions): Promise<ImageStatEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: ImageStatEntity, options?: SaveOptions): Promise<ImageStatEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: ImageStatEntity[], options?: SaveOptions): Promise<ImageStatEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<ImageStatEntity> | FindOptionsWhere<ImageStatEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<ImageStatEntity> | FindOptionsWhere<ImageStatEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
