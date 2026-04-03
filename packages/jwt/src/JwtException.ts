import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";

export class JwtException extends Exception {
  constructor(message: string, key: string, data: Record<string, unknown> = {}) {
    super(message, {
      key,
      status: HttpStatus.Code.InternalServerError,
      data,
    });

    this.name = "JwtException";
  }
}
