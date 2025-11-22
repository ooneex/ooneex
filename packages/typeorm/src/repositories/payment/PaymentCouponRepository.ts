import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { PaymentCouponEntity } from "@/entities/payment/PaymentCouponEntity";

export class PaymentCouponRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<PaymentCouponEntity>> {
    return await this.database.open(PaymentCouponEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<PaymentCouponEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<PaymentCouponEntity>> {
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

  public async findOne(id: string): Promise<PaymentCouponEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<PaymentCouponEntity>): Promise<PaymentCouponEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: PaymentCouponEntity, options?: SaveOptions): Promise<PaymentCouponEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: PaymentCouponEntity[], options?: SaveOptions): Promise<PaymentCouponEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: PaymentCouponEntity, options?: SaveOptions): Promise<PaymentCouponEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: PaymentCouponEntity[], options?: SaveOptions): Promise<PaymentCouponEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<PaymentCouponEntity> | FindOptionsWhere<PaymentCouponEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<PaymentCouponEntity> | FindOptionsWhere<PaymentCouponEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count({ where: criteria });
  }
}
