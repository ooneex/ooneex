import type { S3Options } from "bun";
import { Storage } from "./Storage";
import { decorator } from "./decorators";
import { StorageException } from "./StorageException";

@decorator.storage()
export class CloudflareStorage extends Storage {
  protected bucket: string;
  private readonly accessKey: string;
  private readonly secretKey: string;
  private readonly endpoint: string;
  private readonly region: string;

  constructor() {
    super();

    const accessKey = Bun.env.STORAGE_CLOUDFLARE_ACCESS_KEY;
    const secretKey = Bun.env.STORAGE_CLOUDFLARE_SECRET_KEY;
    const endpoint = Bun.env.STORAGE_CLOUDFLARE_ENDPOINT;

    if (!accessKey) {
      throw new StorageException(
        "Cloudflare access key is required. Please provide an access key either through the constructor options or set the STORAGE_CLOUDFLARE_ACCESS_KEY environment variable.",
      );
    }
    if (!secretKey) {
      throw new StorageException(
        "Cloudflare secret key is required. Please provide a secret key either through the constructor options or set the STORAGE_CLOUDFLARE_SECRET_KEY environment variable.",
      );
    }
    if (!endpoint) {
      throw new StorageException(
        "Cloudflare endpoint is required. Please provide an endpoint either through the constructor options or set the STORAGE_CLOUDFLARE_ENDPOINT environment variable.",
      );
    }

    this.accessKey = accessKey;
    this.secretKey = secretKey;
    this.endpoint = endpoint;
    this.region = Bun.env.STORAGE_CLOUDFLARE_REGION || "EEUR";
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
