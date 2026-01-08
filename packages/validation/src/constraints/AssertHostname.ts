import type { AssertType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

export class AssertHostname extends Validation {
  public getConstraint(): AssertType {
    // Matches IP addresses (0.0.0.0, 127.0.0.1, etc.) or hostnames (localhost, example.com, etc.)
    // Also allows empty string for optional hostname
    return Assert(
      /^$|^((25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)\.){3}(25[0-5]|2[0-4]\d|1\d{2}|[1-9]?\d)$|^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z]{2,})*$/,
    );
  }

  public getErrorMessage(): string | null {
    return "Must be a valid hostname or IP address";
  }
}
