import { Exception } from "@ooneex/exception";
import { Status } from "@ooneex/http-status";

export class TranslationException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: Status.Code.NotFound,
      data,
    });
  }
}
