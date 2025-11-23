import { HttpStatus } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class MethodNotAllowedException<T = unknown> extends Exception<T> {
  constructor(message: string, data?: T) {
    super(message, {
      status: HttpStatus.Code.MethodNotAllowed,
      data,
    });
    this.name = "MethodNotAllowedException";
  }
}
