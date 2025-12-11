import { type } from "arktype";
import type { AssertType, IAssert, ValidationResultType } from "./types";

export abstract class Validation implements IAssert {
  public abstract getConstraint(): AssertType;
  public abstract getErrorMessage(): string | null;

  public validate(data: unknown, constraint?: AssertType): ValidationResultType {
    constraint = constraint || this.getConstraint();

    const out = constraint(data);

    if (out instanceof type.errors) {
      return {
        isValid: false,
        message: this.getErrorMessage() || out.summary,
      };
    }

    return {
      isValid: true,
    };
  }
}
