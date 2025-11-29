import { type Type, type } from "arktype";

export const AssertEmail: Type = type("string.email");
export const AssertAppEnv: Type = type("'local'|'development'|'staging'|'production'");
export type AssertAppEnvType = typeof AssertAppEnv;
