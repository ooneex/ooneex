import { DataSource } from "typeorm";
import { DatabaseException } from "./DatabaseException";
import { TypeormDatabase } from "./TypeormDatabase";
import { decorator } from "./decorators";

@decorator.database()
export class TypeormPgDatabase extends TypeormDatabase {
  public getSource(): DataSource {
    const url = '';

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
