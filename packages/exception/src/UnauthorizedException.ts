import { Status } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class UnauthorizedException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: Status.Code.Unauthorized,
      data,
    });
  }
}
