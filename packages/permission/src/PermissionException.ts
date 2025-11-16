import { Exception } from "@ooneex/exception";
import { Status } from "@ooneex/http-status";

export class PermissionException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: Status.Code.InternalServerError,
      data,
    });
    this.name = "PermissionException";
  }
}
