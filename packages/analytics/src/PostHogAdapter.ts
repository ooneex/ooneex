import { PostHog } from "posthog-node";
import { AnalyticsException } from "./AnalyticsException";
import type { IAnalytics, PostHogAdapterCaptureType } from "./types";

export class PostHogAdapter implements IAnalytics {
  private client: PostHog | null = null;

  constructor(options?: { apiKey?: string; host?: string }) {
    const apiKey = options?.apiKey || Bun.env.ANALYTICS_POSTHOG_API_KEY;

    if (!apiKey) {
      throw new AnalyticsException(
        "PostHog API key is required. Please provide an API key either through the constructor options or set the ANALYTICS_POSTHOG_API_KEY environment variable.",
      );
    }

    if (options?.apiKey) {
      this.client = new PostHog(apiKey, {
        host: options.host || Bun.env.ANALYTICS_POSTHOG_HOST || "https://eu.i.posthog.com",
      });
    }
  }

  public capture = <T extends PostHogAdapterCaptureType>(options: T): void => {
    this.client?.capture({
      distinctId: options.id,
      event: options.event,
      properties: {
        $set: options.properties,
      },
      timestamp: new Date(),
      groups: options.groups,
    });
    this.client?.shutdown();
  };
}
