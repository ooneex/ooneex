import { Assert, createConstraint } from "../utils";

export class AssertPort extends createConstraint(
  () => Assert("1 <= number.integer <= 65535"),
  "Must be a valid port number (1-65535)",
) {}
