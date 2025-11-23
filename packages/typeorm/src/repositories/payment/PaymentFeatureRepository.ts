import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike } from "typeorm";
import { PaymentFeatureEntity } from "../../entities/payment/PaymentFeatureEntity";

export class PaymentFeatureRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<PaymentFeatureEntity>> {
    return await this.database.open(PaymentFeatureEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<PaymentFeatureEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<PaymentFeatureEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply feature search if q parameter is provided
    let findOptions = { ...rest, skip, take };
    if (q) {
      const searchConditions = [{ name: ILike(`%${q}%`) }, { description: ILike(`%${q}%`) }];

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
      const searchConditions = [{ name: ILike(`%${q}%`) }, { description: ILike(`%${q}%`) }];

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

  public async findOne(id: string): Promise<PaymentFeatureEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<PaymentFeatureEntity>): Promise<PaymentFeatureEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: PaymentFeatureEntity, options?: SaveOptions): Promise<PaymentFeatureEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: PaymentFeatureEntity[], options?: SaveOptions): Promise<PaymentFeatureEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: PaymentFeatureEntity, options?: SaveOptions): Promise<PaymentFeatureEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: PaymentFeatureEntity[], options?: SaveOptions): Promise<PaymentFeatureEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<PaymentFeatureEntity> | FindOptionsWhere<PaymentFeatureEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<PaymentFeatureEntity> | FindOptionsWhere<PaymentFeatureEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count({ where: criteria });
  }
}
