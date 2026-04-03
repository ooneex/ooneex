import { HttpStatus } from "@ooneex/http-status";
import { Exception } from "./Exception";

export class UnauthorizedException extends Exception {
  constructor(message: string, key: string, data: Record<string, unknown> = {}) {
    super(message, {
      key,
      status: HttpStatus.Code.Unauthorized,
      data,
    });
    this.name = "UnauthorizedException";
  }
}
