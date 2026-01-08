import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ImageDownloadedEntity } from "../../entities/image/ImageDownloadedEntity";

@decorator.repository()
export class ImageDownloadedRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<ImageDownloadedEntity>> {
    return await this.database.open(ImageDownloadedEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<ImageDownloadedEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<ImageDownloadedEntity>> {
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

  public async findOne(id: string): Promise<ImageDownloadedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<ImageDownloadedEntity>): Promise<ImageDownloadedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: ImageDownloadedEntity, options?: SaveOptions): Promise<ImageDownloadedEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: ImageDownloadedEntity[], options?: SaveOptions): Promise<ImageDownloadedEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: ImageDownloadedEntity, options?: SaveOptions): Promise<ImageDownloadedEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: ImageDownloadedEntity[], options?: SaveOptions): Promise<ImageDownloadedEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<ImageDownloadedEntity> | FindOptionsWhere<ImageDownloadedEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<ImageDownloadedEntity> | FindOptionsWhere<ImageDownloadedEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
