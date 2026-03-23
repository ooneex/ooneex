import { Environment } from "@ooneex/app-env";
import { Assert, createConstraint } from "../utils";

const environments = Object.values(Environment);

export class AssertAppEnv extends createConstraint(
  () => Assert(`"${environments.join('" | "')}"`),
  `Must be a valid environment (${environments.join(", ")})`,
) {}
