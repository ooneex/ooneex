import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ImageDislikedEntity } from "../../entities/image/ImageDislikedEntity";

@decorator.repository()
export class ImageDislikedRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<ImageDislikedEntity>> {
    return await this.database.open(ImageDislikedEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<ImageDislikedEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<ImageDislikedEntity>> {
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

  public async findOne(id: string): Promise<ImageDislikedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<ImageDislikedEntity>): Promise<ImageDislikedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: ImageDislikedEntity, options?: SaveOptions): Promise<ImageDislikedEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: ImageDislikedEntity[], options?: SaveOptions): Promise<ImageDislikedEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: ImageDislikedEntity, options?: SaveOptions): Promise<ImageDislikedEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: ImageDislikedEntity[], options?: SaveOptions): Promise<ImageDislikedEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<ImageDislikedEntity> | FindOptionsWhere<ImageDislikedEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<ImageDislikedEntity> | FindOptionsWhere<ImageDislikedEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
