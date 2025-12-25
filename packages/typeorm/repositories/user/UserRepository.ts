import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike } from "typeorm";
import { UserEntity } from "../../entities/user/UserEntity";

@decorator.repository()
export class UserRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<UserEntity>> {
    return await this.database.open(UserEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<UserEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<UserEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply user search if q parameter is provided
    let findOptions = { ...rest, take, ...(skip !== undefined && { skip }) };
    if (q) {
      const searchConditions = [
        { email: ILike(`%${q}%`) },
        { name: ILike(`%${q}%`) },
        { firstName: ILike(`%${q}%`) },
        { lastName: ILike(`%${q}%`) },
        { username: ILike(`%${q}%`) },
      ];

      findOptions = {
        ...findOptions,
        where: rest.where
          ? [...searchConditions.map((condition) => ({ ...rest.where, ...condition }))]
          : searchConditions,
      };
    }

    const result = await repository.find(findOptions);

    // Apply the same where conditions for count including search
    let countWhere = rest.where;
    if (q) {
      const searchConditions = [
        { email: ILike(`%${q}%`) },
        { name: ILike(`%${q}%`) },
        { firstName: ILike(`%${q}%`) },
        { lastName: ILike(`%${q}%`) },
        { username: ILike(`%${q}%`) },
      ];

      countWhere = rest.where
        ? [...searchConditions.map((condition) => ({ ...rest.where, ...condition }))]
        : searchConditions;
    }

    const total = await this.count(countWhere);
    const totalPages = Math.ceil(total / limit);

    return {
      resources: result,
      total,
      totalPages,
      page,
      limit,
    };
  }

  public async findOne(id: string): Promise<UserEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<UserEntity>): Promise<UserEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: UserEntity, options?: SaveOptions): Promise<UserEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: UserEntity[], options?: SaveOptions): Promise<UserEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: UserEntity, options?: SaveOptions): Promise<UserEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: UserEntity[], options?: SaveOptions): Promise<UserEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(criteria: FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[]): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(criteria?: FindOptionsWhere<UserEntity> | FindOptionsWhere<UserEntity>[]): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
