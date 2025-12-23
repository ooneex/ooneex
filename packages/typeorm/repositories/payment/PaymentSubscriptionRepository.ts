import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { PaymentSubscriptionEntity } from "../../entities/payment/PaymentSubscriptionEntity";

export class PaymentSubscriptionRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<PaymentSubscriptionEntity>> {
    return await this.database.open(PaymentSubscriptionEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<PaymentSubscriptionEntity> & { page?: number; limit?: number },
  ): Promise<FilterResultType<PaymentSubscriptionEntity>> {
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

  public async findOne(id: string): Promise<PaymentSubscriptionEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(
    criteria: FindOptionsWhere<PaymentSubscriptionEntity>,
  ): Promise<PaymentSubscriptionEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: PaymentSubscriptionEntity, options?: SaveOptions): Promise<PaymentSubscriptionEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: PaymentSubscriptionEntity[],
    options?: SaveOptions,
  ): Promise<PaymentSubscriptionEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: PaymentSubscriptionEntity, options?: SaveOptions): Promise<PaymentSubscriptionEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: PaymentSubscriptionEntity[],
    options?: SaveOptions,
  ): Promise<PaymentSubscriptionEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<PaymentSubscriptionEntity> | FindOptionsWhere<PaymentSubscriptionEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<PaymentSubscriptionEntity> | FindOptionsWhere<PaymentSubscriptionEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
