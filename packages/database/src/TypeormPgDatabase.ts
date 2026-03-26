import { injectable } from "@ooneex/container";
import { DataSource } from "typeorm";
import { DatabaseException } from "./DatabaseException";
import { TypeormDatabase } from "./TypeormDatabase";

@injectable()
export class TypeormPgDatabase extends TypeormDatabase {
  public getSource(url?: string): DataSource {
    url = url || Bun.env.DATABASE_URL;

    if (!url) {
      throw new DatabaseException(
        "Database URL is required. Please provide a URL either through the constructor options or set the DATABASE_URL environment variable.",
      );
    }

    this.source = new DataSource({
      synchronize: false,
      entities: [
        // Load your entities here
      ],
      extra: {
        max: 10,
        // idleTimeoutMillis: 30000,
      },
      url,
      type: "postgres",
    });

    return this.source;
  }
}
