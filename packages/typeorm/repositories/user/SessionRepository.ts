import { inject } from "@ooneex/container";
import type { ITypeormDatabaseAdapter } from "@ooneex/database";
import type { FilterResultType } from "@ooneex/types";
import type { FindManyOptions, FindOptionsWhere, Repository, SaveOptions, UpdateResult } from "typeorm";
import { ILike, LessThan } from "typeorm";
import { SessionEntity } from "../../entities/user/SessionEntity";

export class SessionRepository {
  constructor(
    @inject("database")
    private readonly database: ITypeormDatabaseAdapter,
  ) {}

  public async open(): Promise<Repository<SessionEntity>> {
    return await this.database.open(SessionEntity);
  }

  public async close(): Promise<void> {
    await this.database.close();
  }

  public async find(
    criteria: FindManyOptions<SessionEntity> & { page?: number; limit?: number; q?: string },
  ): Promise<FilterResultType<SessionEntity>> {
    const repository = await this.open();

    const { page = 1, limit = 100, q, ...rest } = criteria;

    let skip: number | undefined;
    const take = limit === 0 ? 100 : limit;

    if (page && page > 0 && limit && limit > 0) {
      skip = (page - 1) * take;
    }

    // Apply session search if q parameter is provided
    let findOptions = { ...rest, take, ...(skip !== undefined && { skip }) };
    if (q) {
      const searchConditions = [
        { deviceName: ILike(`%${q}%`) },
        { deviceType: ILike(`%${q}%`) },
        { browser: ILike(`%${q}%`) },
        { operatingSystem: ILike(`%${q}%`) },
        { location: ILike(`%${q}%`) },
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
        { deviceName: ILike(`%${q}%`) },
        { deviceType: ILike(`%${q}%`) },
        { browser: ILike(`%${q}%`) },
        { operatingSystem: ILike(`%${q}%`) },
        { location: ILike(`%${q}%`) },
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

  public async findOne(id: string): Promise<SessionEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { id },
    });
  }

  public async findOneBy(criteria: FindOptionsWhere<SessionEntity>): Promise<SessionEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: criteria,
    });
  }

  public async findByToken(token: string): Promise<SessionEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { token },
    });
  }

  public async findByRefreshToken(refreshToken: string): Promise<SessionEntity | null> {
    const repository = await this.open();

    return await repository.findOne({
      where: { refreshToken },
    });
  }

  public async findActiveSessions(userId: string): Promise<SessionEntity[]> {
    const repository = await this.open();

    return await repository.find({
      where: { user: { id: userId }, isActive: true },
      order: { lastAccessAt: "DESC" },
    });
  }

  public async findExpiredSessions(): Promise<SessionEntity[]> {
    const repository = await this.open();

    return await repository.find({
      where: { expiresAt: LessThan(new Date()), isActive: true },
    });
  }

  public async create(entity: SessionEntity, options?: SaveOptions): Promise<SessionEntity> {
    const repository = await this.open();

    return await repository.save(entity, options);
  }

  public async createMany(entities: SessionEntity[], options?: SaveOptions): Promise<SessionEntity[]> {
    const repository = await this.open();

    return await repository.save(entities, options);
  }

  public async update(entity: SessionEntity, options?: SaveOptions): Promise<SessionEntity> {
    return await this.create(entity, options);
  }

  public async updateMany(entities: SessionEntity[], options?: SaveOptions): Promise<SessionEntity[]> {
    return await this.createMany(entities, options);
  }

  public async delete(
    criteria: FindOptionsWhere<SessionEntity> | FindOptionsWhere<SessionEntity>[],
  ): Promise<UpdateResult> {
    const repository = await this.open();

    return await repository.softDelete(criteria);
  }

  public async revokeSession(sessionId: string, reason?: string): Promise<UpdateResult> {
    const repository = await this.open();

    const updateData: Record<string, unknown> = {
      isActive: false,
      revokedAt: new Date(),
    };

    if (reason !== undefined) {
      updateData.revokedReason = reason;
    }

    return await repository.update(sessionId, updateData);
  }

  public async revokeAllUserSessions(userId: string, reason?: string): Promise<UpdateResult> {
    const repository = await this.open();

    const updateData: Record<string, unknown> = {
      isActive: false,
      revokedAt: new Date(),
    };

    if (reason !== undefined) {
      updateData.revokedReason = reason;
    }

    return await repository.update({ user: { id: userId }, isActive: true }, updateData);
  }

  public async count(criteria?: FindOptionsWhere<SessionEntity> | FindOptionsWhere<SessionEntity>[]): Promise<number> {
    const repository = await this.open();

    return await repository.count(criteria ? { where: criteria } : {});
  }
}
