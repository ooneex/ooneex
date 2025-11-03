import type { S3Options } from "bun";
import { AbstractStorage } from "./AbstractStorage";
import { StorageException } from "./StorageException";

export class CloudflareStorageAdapter extends AbstractStorage {
  protected bucket: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly endpoint: string;
  private readonly region: string;

  constructor(options?: {
    accessKey?: string;
    secretKey?: string;
    endpoint?: string;
    region?: "EEUR" | "WEUR" | "APAC" | "NAM";
  }) {
    super();

    const accessKey = options?.accessKey || Bun.env.CLOUDFLARE_ACCESS_KEY;
    const secretKey = options?.secretKey || Bun.env.CLOUDFLARE_SECRET_KEY;
    const endpoint = options?.endpoint || Bun.env.CLOUDFLARE_ENDPOINT;

    if (!accessKey) {
      throw new StorageException(
        "Cloudflare access key is required. Please provide an access key either through the constructor options or set the CLOUDFLARE_ACCESS_KEY environment variable.",
      );
    }
    if (!secretKey) {
      throw new StorageException(
        "Cloudflare secret key is required. Please provide a secret key either through the constructor options or set the CLOUDFLARE_SECRET_KEY environment variable.",
      );
    }
    if (!endpoint) {
      throw new StorageException(
        "Cloudflare endpoint is required. Please provide an endpoint either through the constructor options or set the CLOUDFLARE_ENDPOINT environment variable.",
      );
    }

    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.endpoint = endpoint;
    this.region = options?.region || Bun.env.CLOUDFLARE_REGION || "EEUR";
  }

  public getOptions(): S3Options {
    return {
      accessKeyId: this.accessKey,
      secretAccessKey: this.secretKey,
      endpoint: this.endpoint,
      bucket: this.bucket,
      region: this.region,
    };
  }
}
