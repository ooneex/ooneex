import { Assert, createConstraint } from "../utils";

export class AssertCountryCode extends createConstraint(
  () => Assert("2 <= string <= 2 & /^[A-Z]{2}$/"),
  "Country code must be a 2-character uppercase ISO 3166-1 alpha-2 code",
) {}
