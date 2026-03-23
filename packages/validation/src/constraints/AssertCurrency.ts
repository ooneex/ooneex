import { CURRENCIES } from "@ooneex/currencies";
import { Assert, createConstraint } from "../utils";

const VALID_CURRENCY_CODES = CURRENCIES.map((currency) => currency.code);

export class AssertCurrency extends createConstraint(
  () => Assert(`"${VALID_CURRENCY_CODES.join('" | "')}" & /^[A-Z]{3}$/`),
  "Currency code must be a valid ISO 4217 currency code (3 uppercase letters)",
) {}
