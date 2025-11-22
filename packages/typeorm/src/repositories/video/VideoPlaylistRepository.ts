import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { VideoPlaylistEntity } from "@/entities/video/VideoPlaylistEntity";

export class VideoPlaylistRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<VideoPlaylistEntity>> {
    return await this.database.open(VideoPlaylistEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<VideoPlaylistEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<VideoPlaylistEntity>> {
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

  public async findOne(id: string): Promise<VideoPlaylistEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<VideoPlaylistEntity>): Promise<VideoPlaylistEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: VideoPlaylistEntity, options?: SaveOptions): Promise<VideoPlaylistEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: VideoPlaylistEntity[], options?: SaveOptions): Promise<VideoPlaylistEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: VideoPlaylistEntity, options?: SaveOptions): Promise<VideoPlaylistEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: VideoPlaylistEntity[], options?: SaveOptions): Promise<VideoPlaylistEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<VideoPlaylistEntity> | FindOptionsWhere<VideoPlaylistEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<VideoPlaylistEntity> | FindOptionsWhere<VideoPlaylistEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count({ where: criteria });
  }
}
