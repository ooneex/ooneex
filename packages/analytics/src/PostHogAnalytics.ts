import { AppEnv } from "@ooneex/app-env";
import { inject } from "@ooneex/container";
import { PostHog } from "posthog-node";
import { AnalyticsException } from "./AnalyticsException";
import { decorator } from "./decorators";
import type { IAnalytics, PostHogCaptureOptionsType, PostHogConfigType } from "./types";

@decorator.analytics()
export class PostHogAnalytics<T extends PostHogCaptureOptionsType = PostHogCaptureOptionsType>
  implements IAnalytics<T>
{
  private client: PostHog | null = null;

  constructor(@inject(AppEnv) private readonly env: AppEnv, config?: PostHogConfigType) {
    const apiKey = config?.apiKey || this.env.ANALYTICS_POSTHOG_API_KEY?.trim();

    if (!apiKey) {
      throw new AnalyticsException(
        "PostHog API key is required. Please provide an API key either through the constructor options or set the ANALYTICS_POSTHOG_API_KEY environment variable.",
      );
    }

    this.client = new PostHog(apiKey, {
      host: config?.host || this.env.ANALYTICS_POSTHOG_HOST?.trim() || "https://eu.i.posthog.com",
    });
  }

  public capture(options: T): void {
    this.client?.capture({
      distinctId: options.id,
      event: options.event,
      properties: {
        $set: options.properties,
      },
      timestamp: new Date(),
      ...(options.groups && { groups: options.groups }),
    });
    this.client?.shutdown();
  }
}
