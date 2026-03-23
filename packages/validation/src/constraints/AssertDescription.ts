import { Assert, createConstraint } from "../utils";

export class AssertDescription extends createConstraint(
  () => Assert("1 <= string <= 5000"),
  "Description must be between 1 and 5000 characters",
) {}
