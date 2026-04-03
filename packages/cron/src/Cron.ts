import type { TimeZoneType } from "@ooneex/country";
import { CronJob } from "cron";
import { CronException } from "./CronException";
import { convertToCrontab } from "./helper";
import type { CronTimeType, ICron } from "./types";

export abstract class Cron implements ICron {
  private cronJob: CronJob | null = null;

  public abstract getTime(): CronTimeType;
  public abstract handler(): Promise<void>;
  public abstract getTimeZone(): TimeZoneType | null;

  public async start(): Promise<void> {
    if (this.isActive()) {
      return;
    }

    if (this.cronJob) {
      this.cronJob.start();
      return;
    }

    const cronExpression = convertToCrontab(this.getTime());

    try {
      const cronParams: {
        cronTime: string;
        onTick: () => Promise<void>;
        start: boolean;
        timeZone?: string;
      } = {
        cronTime: cronExpression,
        onTick: async () => {
          await this.handler();
        },
        start: true,
      };

      const timeZone = this.getTimeZone();
      if (timeZone !== null) {
        cronParams.timeZone = timeZone;
      }

      this.cronJob = CronJob.from(cronParams);
    } catch (error) {
      throw new CronException("Failed to start cron job", "START_FAILED", {
        time: this.getTime(),
        cronExpression,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  public async stop(): Promise<void> {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }

  public isActive(): boolean {
    if (!this.cronJob) {
      return false;
    }

    return this.cronJob.isActive;
  }
}
