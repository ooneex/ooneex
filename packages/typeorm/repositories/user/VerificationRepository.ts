import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike, MoreThan } from "typeorm";
import { VerificationEntity } from "../../entities/user/VerificationEntity";

export class VerificationRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<VerificationEntity>> {
    return await this.database.open(VerificationEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<VerificationEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<VerificationEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply verification search if q parameter is provided
    let findOptions = { ...rest, take, ...(skip !== undefined && { skip }) };
    if (q) {
      const searchConditions = [
        { email: ILike(`%${q}%`) },
        { phone: ILike(`%${q}%`) },
        { token: ILike(`%${q}%`) },
        { code: ILike(`%${q}%`) },
        { description: ILike(`%${q}%`) },
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
        { phone: ILike(`%${q}%`) },
        { token: ILike(`%${q}%`) },
        { code: ILike(`%${q}%`) },
        { description: ILike(`%${q}%`) },
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

  public async findOne(id: string): Promise<VerificationEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<VerificationEntity>): Promise<VerificationEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async findByToken(token: string): Promise<VerificationEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { token, isUsed: false, expiresAt: MoreThan(new Date()) },
    });
  }

  public async findByCode(code: string): Promise<VerificationEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { code, isUsed: false, expiresAt: MoreThan(new Date()) },
    });
  }

  public async create(entity: VerificationEntity, options?: SaveOptions): Promise<VerificationEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: VerificationEntity[], options?: SaveOptions): Promise<VerificationEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: VerificationEntity, options?: SaveOptions): Promise<VerificationEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: VerificationEntity[], options?: SaveOptions): Promise<VerificationEntity[]> {
    return await this.createMany(entities, options);
  }

  public async markAsUsed(id: string): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.update(id, {
      isUsed: true,
      usedAt: new Date(),
    });
  }

  public async incrementAttempts(id: string): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository
      .createQueryBuilder()
      .update(VerificationEntity)
      .set({ attemptsCount: () => "attempts_count + 1" })
      .where("id = :id", { id })
      .execute();
  }

  public async delete(
    criteria: FindOptionsWhere<VerificationEntity> | FindOptionsWhere<VerificationEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async count(
    criteria?: FindOptionsWhere<VerificationEntity> | FindOptionsWhere<VerificationEntity>[],
  ): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
