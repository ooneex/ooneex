// biome-ignore lint/suspicious/noExplicitAny: trust me
export type AnalyticsClassType = new (...args: any[]) => IAnalytics;

export interface IAnalytics {
  capture: (options: PostHogAdapterCaptureType) => void;
}

export type PostHogAdapterCaptureType = {
  id: string;
  event: string;
  properties?: Record<string, unknown>;
  groups?: Record<string, string | number>;
};
