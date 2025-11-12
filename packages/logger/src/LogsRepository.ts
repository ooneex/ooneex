import { deserialize, serialize } from "bun:jsc";
import { random } from "@ooneex/utils";
import { sql } from "bun";
import type { LogsDatabase } from "./LogsDatabase";
import type { LogsEntity } from "./LogsEntity";
import type { FindByCriteriaType, FindByResultType } from "./types";

type RawLogRecordType = {
  id: string;
  level: string;
  message?: string;
  date: string;
  userId?: string;
  email?: string;
  lastName?: string;
  firstName?: string;
  status?: number;
  exceptionName?: string;
  stackTrace?: Buffer;
  ip?: string;
  method?: string;
  path?: string;
  userAgent?: string;
  referer?: string;
  params?: Buffer;
  payload?: Buffer;
  queries?: Buffer;
};

export class LogsRepository {
  constructor(private db: LogsDatabase) {}

  public async create(log: LogsEntity): Promise<LogsEntity> {
    const client = this.db.getClient();

    const data = {
      ...log,
      id: random.nanoid(15),
      date: log.date.toISOString(),
      stackTrace: log.stackTrace ? serialize(log.stackTrace) : null,
      params: log.params ? serialize(log.params) : null,
      payload: log.payload ? serialize(log.payload) : null,
      queries: log.queries ? serialize(log.queries) : null,
    };

    const [newLog] = await client`
      INSERT INTO logs ${sql(data)}
      RETURNING *
    `;

    await this.db.close();

    return newLog as LogsEntity;
  }

  public async find(id: string): Promise<LogsEntity | null> {
    const client = this.db.getClient();

    const [log] = await client`
      SELECT * FROM logs
      WHERE id = ${id}
      LIMIT 1
    `;

    if (!log) {
      await this.db.close();
      return null;
    }

    const result = {
      ...log,
      date: new Date(log.date),
      stackTrace: log.stackTrace ? deserialize(log.stackTrace) : undefined,
      params: log.params ? deserialize(log.params) : undefined,
      payload: log.payload ? deserialize(log.payload) : undefined,
      queries: log.queries ? deserialize(log.queries) : undefined,
    };

    await this.db.close();

    return result;
  }

  public async findBy(criteria: FindByCriteriaType): Promise<FindByResultType> {
    const client = this.db.getClient();

    // Build WHERE conditions using SQL fragments
    const whereConditions: unknown[] = [];

    if (criteria.level !== undefined) {
      whereConditions.push(sql`level = ${criteria.level}`);
    }

    if (criteria.userId !== undefined) {
      whereConditions.push(sql`userId = ${criteria.userId}`);
    }

    if (criteria.email !== undefined) {
      whereConditions.push(sql`email = ${criteria.email}`);
    }

    if (criteria.lastName !== undefined) {
      whereConditions.push(sql`lastName = ${criteria.lastName}`);
    }

    if (criteria.firstName !== undefined) {
      whereConditions.push(sql`firstName = ${criteria.firstName}`);
    }

    if (criteria.status !== undefined) {
      whereConditions.push(sql`status = ${criteria.status}`);
    }

    if (criteria.exceptionName !== undefined) {
      whereConditions.push(sql`exceptionName = ${criteria.exceptionName}`);
    }

    if (criteria.method !== undefined) {
      whereConditions.push(sql`method = ${criteria.method}`);
    }

    if (criteria.path !== undefined) {
      whereConditions.push(sql`path = ${criteria.path}`);
    }

    // Handle pagination
    const limit = criteria.limit || 100; // Default limit of 100
    const page = criteria.page || 1; // Default to page 1
    const offset = (page - 1) * limit;

    // If no criteria provided, get all records with pagination
    if (whereConditions.length === 0) {
      const [countResult] = await client`SELECT COUNT(*) as total FROM logs`;
      const logs = await client`
        SELECT * FROM logs
        ORDER BY date DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;

      const transformedLogs = logs.map((log: RawLogRecordType) => ({
        ...log,
        date: new Date(log.date),
        stackTrace: log.stackTrace ? deserialize(log.stackTrace) : undefined,
        params: log.params ? deserialize(log.params) : undefined,
        payload: log.payload ? deserialize(log.payload) : undefined,
        queries: log.queries ? deserialize(log.queries) : undefined,
      })) as LogsEntity[];

      const total = countResult.total;
      const totalPages = Math.ceil(total / limit);

      const result = {
        logs: transformedLogs,
        total,
        page,
        limit,
        totalPages,
      };

      await this.db.close();

      return result;
    }

    // Build the WHERE clause by joining fragments with AND
    const whereClause = whereConditions.reduce((acc, condition, index) => {
      if (index === 0) {
        return condition;
      }
      return sql`${acc} AND ${condition}`;
    });

    // Get total count for pagination
    const [countResult] = await client`
      SELECT COUNT(*) as total
      FROM logs
      WHERE ${whereClause}
    `;

    // Execute the query with proper SQL fragment composition and pagination
    const logs = await client`
      SELECT * FROM logs
      WHERE ${whereClause}
      ORDER BY date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // Transform and deserialize results
    const transformedLogs = logs.map((log: RawLogRecordType) => ({
      ...log,
      date: new Date(log.date),
      params: log.params ? deserialize(log.params) : undefined,
      payload: log.payload ? deserialize(log.payload) : undefined,
      queries: log.queries ? deserialize(log.queries) : undefined,
    }));

    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);

    const result = {
      logs: transformedLogs,
      total,
      page,
      limit,
      totalPages,
    };

    await this.db.close();

    return result;
  }
}
