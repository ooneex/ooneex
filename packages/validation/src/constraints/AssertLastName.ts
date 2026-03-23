import { Assert, createConstraint } from "../utils";

export class AssertLastName extends createConstraint(
  () => Assert("1 <= string <= 50 & /^[a-zA-Z\\s'-]+$/"),
  "Last name must be between 1 and 50 characters and contain only letters, spaces, hyphens, and apostrophes",
) {}
