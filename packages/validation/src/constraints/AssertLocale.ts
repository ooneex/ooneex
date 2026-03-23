import { locales } from "@ooneex/translation";
import { Assert, createConstraint } from "../utils";

export class AssertLocale extends createConstraint(
  () => Assert(`"${locales.join('" | "')}"`),
  "Locale must be a valid locale code",
) {}
