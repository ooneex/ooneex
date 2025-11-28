export enum ECronPrefix {
  IN = "in",
  EVERY = "every",
}

export enum ECronSuffix {
  SECONDS = "seconds",
  MINUTES = "minutes",
  HOURS = "hours",
  DAYS = "days",
  MONTHS = "months",
  YEARS = "years",
}

export type PrefixType = `${ECronPrefix}`;
export type SuffixType = `${ECronSuffix}`;
export type CronTimeType = `${PrefixType} ${number} ${SuffixType}`;

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type CronClassType = new (...args: any[]) => ICron;

export interface ICron {
  getTime: () => CronTimeType;
  setTime?: (tim: CronTimeType) => ICron;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  job: () => Promise<void>;
  getTimeZone: () => Promise<string | null>;
  isActive: () => boolean;
}
