import { Environment } from "@ooneex/app-env";
import type { AssertType } from "../types";
import { Assert } from "../utils";
import { Validation } from "../Validation";

const environments = Object.values(Environment);

export class AssertAppEnv extends Validation {
  public getConstraint(): AssertType {
    return Assert(`"${environments.join('" | "')}"`);
  }

  public getErrorMessage(): string | null {
    return `Must be a valid environment (${environments.join(", ")})`;
  }
}
