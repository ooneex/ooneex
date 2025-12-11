import type { AssertType, ValidationResultType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

const YOUTUBE_URL_PATTERNS = [
  /^https?:\/\/(www\.)?youtube\.com\/watch\?v=[A-Za-z0-9_-]+$/,
  /^https?:\/\/youtu\.be\/[A-Za-z0-9_-]+$/,
];

export class AssertYoutubeUrl extends Validation {
  public getConstraint(): AssertType {
    return Assert("string");
  }

  public getErrorMessage(): string | null {
    return "Must be a valid YouTube URL (e.g., https://youtube.com/watch?v=dQw4w9WgXcQ or https://youtu.be/dQw4w9WgXcQ)";
  }

  public override validate(data: unknown, constraint?: AssertType): ValidationResultType {
    const basicValidation = super.validate(data, constraint);
    if (!basicValidation.isValid) {
      return basicValidation;
    }

    const url = data as string;
    const isValidYouTubeUrl = YOUTUBE_URL_PATTERNS.some((pattern) => pattern.test(url));

    if (!isValidYouTubeUrl) {
      return {
        isValid: false,
        message: this.getErrorMessage() || "Invalid YouTube URL",
      };
    }

    return {
      isValid: true,
    };
  }
}
