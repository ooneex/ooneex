import { inject } from "@ooneex/container";
import type { ITypeormDatabase } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike } from "typeorm";
import { AccountEntity } from "../../entities/user/AccountEntity";

@decorator.repository()
export class AccountRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabase,
  ) {}

  public async open(): Promise<Repository<AccountEntity>> {
    return await this.database.open(AccountEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<AccountEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<AccountEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply account search if q parameter is provided
    let findOptions = { ...rest, take, ...(skip !== undefined && { skip }) };
    if (q) {
      const searchConditions = [
        { provider: ILike(`%${q}%`) },
        { providerAccountId: ILike(`%${q}%`) },
        { email: ILike(`%${q}%`) },
        { name: ILike(`%${q}%`) },
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
        { provider: ILike(`%${q}%`) },
        { providerAccountId: ILike(`%${q}%`) },
        { email: ILike(`%${q}%`) },
        { name: ILike(`%${q}%`) },
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

  public async findOne(id: string): Promise<AccountEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<AccountEntity>): Promise<AccountEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: AccountEntity, options?: SaveOptions): Promise<AccountEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: AccountEntity[], options?: SaveOptions): Promise<AccountEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: AccountEntity, options?: SaveOptions): Promise<AccountEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: AccountEntity[], options?: SaveOptions): Promise<AccountEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<AccountEntity> | FindOptionsWhere<AccountEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(criteria?: FindOptionsWhere<AccountEntity> | FindOptionsWhere<AccountEntity>[]): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
