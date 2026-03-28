import { AppEnv } from "@ooneex/app-env";
import { inject, injectable } from "@ooneex/container";
import type { JWTHeaderParameters } from "jose";
import * as jose from "jose";
import { JwtException } from "./JwtException";
import type { IJwt, JwtDefaultPayloadType, JwtPayloadType } from "./types";

@injectable()
export class Jwt implements IJwt {
  private secret: Uint8Array<ArrayBuffer>;

  constructor(
    @inject(AppEnv) private readonly env: AppEnv,
    secret?: string,
  ) {
    secret = secret || this.env.JWT_SECRET;

    if (!secret) {
      throw new JwtException(
        "JWT secret is required. Please provide a secret either through the constructor options or set the JWT_SECRET environment variable.",
      );
    }

    this.secret = new TextEncoder().encode(secret);
  }

  public async create<T extends Record<string, unknown> = Record<string, unknown>>(config?: {
    payload?: JwtDefaultPayloadType & JwtPayloadType<T>;
    header?: JWTHeaderParameters;
  }): Promise<string> {
    const alg = "HS256";
    const payload: JwtDefaultPayloadType = config?.payload ?? {};

    const { iss, sub, aud, exp, iat, jti, nbf, ...rest } = payload;

    const token = new jose.SignJWT(rest).setProtectedHeader({ ...{ alg }, ...(config?.header ?? {}) });

    if (iss) {
      token.setIssuer(iss);
    }

    if (sub) {
      token.setSubject(sub);
    }

    if (aud) {
      token.setAudience(aud);
    }

    if (exp) {
      token.setExpirationTime(exp ?? "1h");
    }

    if (iat) {
      token.setIssuedAt(iat);
    }

    if (nbf) {
      token.setNotBefore(nbf);
    }

    if (jti) {
      token.setJti(jti);
    }

    return await token.sign(this.secret);
  }

  public getSecret(): Uint8Array<ArrayBuffer> {
    return this.secret;
  }

  public async isValid(token: string): Promise<boolean> {
    try {
      await jose.jwtVerify(token, this.secret);

      return true;
    } catch (_error) {
      return false;
    }
  }

  public getHeader<T = JWTHeaderParameters>(token: string): T {
    return jose.decodeProtectedHeader(token) as T;
  }

  public getPayload<T extends Record<string, unknown> = Record<string, unknown>>(token: string): JwtPayloadType<T> {
    return jose.decodeJwt(token) as JwtPayloadType<T>;
  }
}
