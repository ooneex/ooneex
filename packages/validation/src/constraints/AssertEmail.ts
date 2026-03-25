import { Assert, createConstraint } from "../utils";

export class AssertEmail extends createConstraint(() => Assert("string.email"), "Must be a valid email address") {}
