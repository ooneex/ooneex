import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { VideoStatEntity } from "../../entities/video/VideoStatEntity";

@decorator.repository()
export class VideoStatRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<VideoStatEntity>> {
    return await this.database.open(VideoStatEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<VideoStatEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<VideoStatEntity>> {
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

  public async findOne(id: string): Promise<VideoStatEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<VideoStatEntity>): Promise<VideoStatEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: VideoStatEntity, options?: SaveOptions): Promise<VideoStatEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: VideoStatEntity[], options?: SaveOptions): Promise<VideoStatEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: VideoStatEntity, options?: SaveOptions): Promise<VideoStatEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: VideoStatEntity[], options?: SaveOptions): Promise<VideoStatEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<VideoStatEntity> | FindOptionsWhere<VideoStatEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<VideoStatEntity> | FindOptionsWhere<VideoStatEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
