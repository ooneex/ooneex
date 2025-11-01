export interface IAnalytics {
  capture: <T extends PostHogAdapterCaptureType>(options: T) => void;
}

export type PostHogAdapterCaptureType = {
  id: string;
  event: string;
  properties?: Record<string, unknown>;
  groups?: Record<string, string | number>;
};
