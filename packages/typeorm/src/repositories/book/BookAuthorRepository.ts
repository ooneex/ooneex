import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { BookAuthorEntity } from "@/entities/book/BookAuthorEntity";

export class BookAuthorRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<BookAuthorEntity>> {
    return await this.database.open(BookAuthorEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<BookAuthorEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<BookAuthorEntity>> {
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

  public async findOne(id: string): Promise<BookAuthorEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<BookAuthorEntity>): Promise<BookAuthorEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: BookAuthorEntity, options?: SaveOptions): Promise<BookAuthorEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: BookAuthorEntity[], options?: SaveOptions): Promise<BookAuthorEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: BookAuthorEntity, options?: SaveOptions): Promise<BookAuthorEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: BookAuthorEntity[], options?: SaveOptions): Promise<BookAuthorEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<BookAuthorEntity> | FindOptionsWhere<BookAuthorEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<BookAuthorEntity> | FindOptionsWhere<BookAuthorEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count({ where: criteria });
  }
}
