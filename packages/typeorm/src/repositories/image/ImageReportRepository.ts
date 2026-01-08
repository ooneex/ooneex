import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ImageReportEntity } from "../../entities/image/ImageReportEntity";

@decorator.repository()
export class ImageReportRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<ImageReportEntity>> {
    return await this.database.open(ImageReportEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<ImageReportEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<ImageReportEntity>> {
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

  public async findOne(id: string): Promise<ImageReportEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<ImageReportEntity>): Promise<ImageReportEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: ImageReportEntity, options?: SaveOptions): Promise<ImageReportEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: ImageReportEntity[], options?: SaveOptions): Promise<ImageReportEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: ImageReportEntity, options?: SaveOptions): Promise<ImageReportEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: ImageReportEntity[], options?: SaveOptions): Promise<ImageReportEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<ImageReportEntity> | FindOptionsWhere<ImageReportEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<ImageReportEntity> | FindOptionsWhere<ImageReportEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
