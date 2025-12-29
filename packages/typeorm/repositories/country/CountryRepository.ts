import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { CountryEntity } from "../../entities/country/CountryEntity";

@decorator.repository()
export class CountryRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<CountryEntity>> {
    return await this.database.open(CountryEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<CountryEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<CountryEntity>> {
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

  public async findOne(id: string): Promise<CountryEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<CountryEntity>): Promise<CountryEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: CountryEntity, options?: SaveOptions): Promise<CountryEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: CountryEntity[], options?: SaveOptions): Promise<CountryEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: CountryEntity, options?: SaveOptions): Promise<CountryEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: CountryEntity[], options?: SaveOptions): Promise<CountryEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<CountryEntity> | FindOptionsWhere<CountryEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(criteria?: FindOptionsWhere<CountryEntity> | FindOptionsWhere<CountryEntity>[]): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
