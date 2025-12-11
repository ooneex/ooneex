import { CURRENCIES } from "@ooneex/currencies";
import type { AssertType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

const VALID_CURRENCY_CODES = CURRENCIES.map((currency) => currency.code);

export class AssertCurrency extends Validation {
  public getConstraint(): AssertType {
    return Assert(`"${VALID_CURRENCY_CODES.join('" | "')}" & /^[A-Z]{3}$/`);
  }

  public getErrorMessage(): string | null {
    return "Currency code must be a valid ISO 4217 currency code (3 uppercase letters)";
  }
}
