import { HttpStatus } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class UnauthorizedException extends Exception {
  constructor(message: string, data: Record<string, unknown> = {}) {
    super(message, {
      status: HttpStatus.Code.Unauthorized,
      data,
    });
    this.name = "UnauthorizedException";
  }
}
