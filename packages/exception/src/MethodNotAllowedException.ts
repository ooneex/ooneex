import { HttpStatus } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class MethodNotAllowedException extends Exception {
  constructor(message: string, data: Record<string, unknown> = {}) {
    super(message, {
      status: HttpStatus.Code.MethodNotAllowed,
      data,
    });
    this.name = "MethodNotAllowedException";
  }
}
