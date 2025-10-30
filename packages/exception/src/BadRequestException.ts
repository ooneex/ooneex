import { Status } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class BadRequestException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: Status.Code.BadRequest,
      data,
    });
  }
}
