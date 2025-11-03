import type { BunFile, S3File, S3Options } from "bun";
import type { IStorage } from "./types";

export abstract class AbstractStorage implements IStorage {
  protected client: Bun.S3Client | null = null;
  public abstract getOptions(): S3Options;
  protected abstract bucket: string;

  public setBucket(name: string): this {
    this.bucket = name;
    this.client = new Bun.S3Client(this.getOptions());

    return this;
  }

  public async list(): Promise<string[]> {
    const client = this.getClient();

    return (await client.list()).contents?.map((content) => content.key) || [];
  }

  public async clearBucket(): Promise<this> {
    const client = this.getClient();
    const keys = await this.list();

    for (const key of keys) {
      await client.delete(key);
    }

    return this;
  }

  public async exists(key: string): Promise<boolean> {
    const client = this.getClient();

    return await client.exists(key);
  }

  public async delete(key: string): Promise<void> {
    const client = this.getClient();

    await client.delete(key);
  }

  public async putFile(key: string, localPath: string): Promise<number> {
    const file = Bun.file(localPath);

    return await this.put(key, file);
  }

  public async put(
    key: string,
    content: string | ArrayBuffer | SharedArrayBuffer | Request | Response | BunFile | S3File | Blob,
  ): Promise<number> {
    const s3file: S3File = this.getS3File(key);

    return await s3file.write(content);
  }

  public async getAsJson<T>(key: string): Promise<T> {
    const s3file: S3File = this.getS3File(key);

    return await s3file.json();
  }

  public async getAsArrayBuffer(key: string): Promise<ArrayBuffer> {
    const s3file: S3File = this.getS3File(key);

    return await s3file.arrayBuffer();
  }

  public getAsStream(key: string): ReadableStream {
    const s3file: S3File = this.getS3File(key);

    return s3file.stream();
  }

  protected getClient(): Bun.S3Client {
    if (!this.client) {
      this.client = new Bun.S3Client(this.getOptions());
    }

    return this.client;
  }

  protected getS3File(path: string): S3File {
    const client = this.getClient();

    return client.file(path);
  }
}
