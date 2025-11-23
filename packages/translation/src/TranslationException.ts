import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";

export class TranslationException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: HttpStatus.Code.NotFound,
      data,
    });
    this.name = "TranslationException";
  }
}
