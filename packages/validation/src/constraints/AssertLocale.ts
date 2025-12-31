import { locales } from "@ooneex/translation";
import type { AssertType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

export class AssertLocale extends Validation {
  public getConstraint(): AssertType {
    return Assert(`"${locales.join('" | "')}"`);
  }

  public getErrorMessage(): string | null {
    return "Locale must be a valid locale code";
  }
}
