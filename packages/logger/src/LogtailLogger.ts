import { Logtail } from "@logtail/node";
import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import type { IException } from "@ooneex/exception";
import type { ScalarType } from "@ooneex/types";
import { decorator } from "./decorators";
import { LoggerException } from "./LoggerException";
import type { ILogger } from "./types";

@decorator.logger()
export class LogtailLogger implements ILogger {
  private logtail!: Logtail;

  constructor(@inject(AppEnv) private readonly env: AppEnv) {}

  public init(): void {
    const sourceToken = this.env.LOGTAIL_SOURCE_TOKEN;
    if (!sourceToken) {
      throw new LoggerException(
        "Logtail source token is required. Please set the LOGTAIL_SOURCE_TOKEN environment variable.",
      );
    }

    const endpoint = this.env.LOGTAIL_ENDPOINT;

    this.logtail = new Logtail(sourceToken, {
      ...(endpoint && { endpoint }),
    });
  }

  public error(message: string | IException, data?: Record<string, ScalarType>): void {
    if (typeof message === "string") {
      this.logtail.error(message, data);
    } else {
      this.logtail.error(message.message ?? "Unknown error", {
        ...data,
        ...this.extractExceptionData(message),
      });
    }
  }

  public warn(message: string, data?: Record<string, ScalarType>): void {
    this.logtail.warn(message, data);
  }

  public info(message: string, data?: Record<string, ScalarType>): void {
    this.logtail.info(message, data);
  }

  public debug(message: string, data?: Record<string, ScalarType>): void {
    this.logtail.debug(message, data);
  }

  public log(message: string, data?: Record<string, ScalarType>): void {
    this.logtail.info(message, { ...data, level: "LOG" });
  }

  public success(message: string, data?: Record<string, ScalarType>): void {
    this.logtail.info(message, { ...data, level: "SUCCESS" });
  }

  public async flush(): Promise<void> {
    await this.logtail.flush();
  }

  private extractExceptionData(exception: IException): Record<string, ScalarType> {
    const data: Record<string, ScalarType> = {};

    if (exception.name !== undefined) data.exceptionName = exception.name;
    if (exception.status !== undefined) data.status = exception.status;

    const stackTrace = exception.stackToJson();
    if (stackTrace !== undefined && stackTrace !== null) {
      data.stackTrace = JSON.stringify(stackTrace);
    }

    return data;
  }
}
