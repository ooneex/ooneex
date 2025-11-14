type PrefixType = "in" | "every";
type SuffixType = "seconds" | "minutes" | "hours" | "days" | "months" | "years";
export type CronTimeType = `${PrefixType} ${number} ${SuffixType}`;

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type CronClassType = new (...args: any[]) => ICron;

export interface ICron {
  getTime: () => CronTimeType;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  job: () => Promise<void>;
  getTimeZone: () => Promise<string | null>;
  isActive: () => boolean;
}
