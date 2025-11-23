import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";

export class CronException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: HttpStatus.Code.InternalServerError,
      data,
    });
    this.name = "CronException";
  }
}
