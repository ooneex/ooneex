import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { FolderDownloadedEntity } from "../../entities/folder/FolderDownloadedEntity";

@decorator.repository()
export class FolderDownloadedRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<FolderDownloadedEntity>> {
    return await this.database.open(FolderDownloadedEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<FolderDownloadedEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<FolderDownloadedEntity>> {
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

  public async findOne(id: string): Promise<FolderDownloadedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<FolderDownloadedEntity>): Promise<FolderDownloadedEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: FolderDownloadedEntity, options?: SaveOptions): Promise<FolderDownloadedEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: FolderDownloadedEntity[],
    options?: SaveOptions,
  ): Promise<FolderDownloadedEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: FolderDownloadedEntity, options?: SaveOptions): Promise<FolderDownloadedEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: FolderDownloadedEntity[],
    options?: SaveOptions,
  ): Promise<FolderDownloadedEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<FolderDownloadedEntity> | FindOptionsWhere<FolderDownloadedEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<FolderDownloadedEntity> | FindOptionsWhere<FolderDownloadedEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
