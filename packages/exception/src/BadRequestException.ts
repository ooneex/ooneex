import { HttpStatus } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class BadRequestException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: HttpStatus.Code.BadRequest,
      data,
    });
    this.name = "BadRequestException";
  }
}
