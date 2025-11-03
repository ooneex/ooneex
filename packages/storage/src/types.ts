import type { BunFile, S3File } from "bun";

export interface IStorage {
  setBucket(name: string): this;
  list(): Promise<string[]>;
  clearBucket(): Promise<this>;
  exists(key: string): Promise<boolean>;
  delete(key: string): Promise<void>;
  putFile(key: string, localPath: string): Promise<number>;
  put(
    key: string,
    content: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer | Request | Response | BunFile | S3File | Blob,
  ): Promise<number>;
  getAsJson<T = unknown>(key: string): Promise<T>;
  getAsArrayBuffer(key: string): Promise<ArrayBuffer>;
  getAsStream(key: string): ReadableStream;
}
