import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import { decorator } from "@ooneex/repository";
import type { FilterResultType } from "@ooneex/types";
import { EProfileUpdateStatus } from "@ooneex/user";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike } from "typeorm";
import { UserProfileUpdateEntity } from "../../entities/user/UserProfileUpdateEntity";

@decorator.repository()
export class UserProfileUpdateRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<UserProfileUpdateEntity>> {
    return await this.database.open(UserProfileUpdateEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<UserProfileUpdateEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<UserProfileUpdateEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply user profile update search if q parameter is provided
    let findOptions = { ...rest, take, ...(skip !== undefined && { skip }) };
    if (q) {
      const searchConditions = [{ updateReason: ILike(`%${q}%`) }, { description: ILike(`%${q}%`) }];

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
      const searchConditions = [{ updateReason: ILike(`%${q}%`) }, { description: ILike(`%${q}%`) }];

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

  public async findOne(id: string): Promise<UserProfileUpdateEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<UserProfileUpdateEntity>): Promise<UserProfileUpdateEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async create(entity: UserProfileUpdateEntity, options?: SaveOptions): Promise<UserProfileUpdateEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(
    entities: UserProfileUpdateEntity[],
    options?: SaveOptions,
  ): Promise<UserProfileUpdateEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: UserProfileUpdateEntity, options?: SaveOptions): Promise<UserProfileUpdateEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(
    entities: UserProfileUpdateEntity[],
    options?: SaveOptions,
  ): Promise<UserProfileUpdateEntity[]> {
    return await this.createMany(entities, options);
  }

  public async markAsCompleted(id: string): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.update(id, {
      status: EProfileUpdateStatus.COMPLETED,
      appliedAt: new Date(),
    });
  }

  public async markAsFailed(id: string, reason?: string): Promise<UpdateResult> {
    const repository = await this.open();

    const updateData: Record<string, unknown> = {
      status: EProfileUpdateStatus.FAILED,
    };

    if (reason !== undefined) {
      updateData.description = reason;
    }

    return await repository.update(id, updateData);
  }

  public async markAsReverted(id: string, reason?: string): Promise<UpdateResult> {
    const repository = await this.open();

    const updateData: Record<string, unknown> = {
      status: EProfileUpdateStatus.REVERTED,
    };

    if (reason !== undefined) {
      updateData.description = reason;
    }

    return await repository.update(id, updateData);
  }

  public async delete(
    criteria: FindOptionsWhere<UserProfileUpdateEntity> | FindOptionsWhere<UserProfileUpdateEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<UserProfileUpdateEntity> | FindOptionsWhere<UserProfileUpdateEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
