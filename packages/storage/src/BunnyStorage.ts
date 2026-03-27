import { readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import type { BunFile, S3File } from "bun";
import { decorator } from "./decorators";
import { StorageException } from "./StorageException";
import type { GetFileOptionsType, IStorage, PutDirOptionsType } from "./types";

type BunnyRegionType = "de" | "uk" | "ny" | "la" | "sg" | "se" | "br" | "jh" | "syd";

type BunnyFileInfoType = {
  Guid: string;
  StorageZoneName: string;
  Path: string;
  ObjectName: string;
  Length: number;
  LastChanged: string;
  ServerId: number;
  ArrayNumber: number;
  IsDirectory: boolean;
  UserId: string;
  ContentType: string;
  DateCreated: string;
  StorageZoneId: number;
  Checksum: string | null;
  ReplicatedZones: string | null;
};

const REGION_ENDPOINTS: Record<BunnyRegionType, string> = {
  de: "storage.bunnycdn.com",
  uk: "uk.storage.bunnycdn.com",
  ny: "ny.storage.bunnycdn.com",
  la: "la.storage.bunnycdn.com",
  sg: "sg.storage.bunnycdn.com",
  se: "se.storage.bunnycdn.com",
  br: "br.storage.bunnycdn.com",
  jh: "jh.storage.bunnycdn.com",
  syd: "syd.storage.bunnycdn.com",
};

@decorator.storage()
export class BunnyStorage implements IStorage {
  private bucket = "";
  private readonly accessKey: string;
  private readonly storageZone: string;
  private readonly region: BunnyRegionType;
  private readonly baseUrl: string;

  constructor() {
    const accessKey = Bun.env.STORAGE_BUNNY_ACCESS_KEY;
    const storageZone = Bun.env.STORAGE_BUNNY_STORAGE_ZONE;
    const region = Bun.env.STORAGE_BUNNY_REGION as BunnyRegionType | undefined;

    if (!accessKey) {
      throw new StorageException(
        "Bunny access key is required. Please provide an access key either through the constructor options or set the STORAGE_BUNNY_ACCESS_KEY environment variable.",
      );
    }
    if (!storageZone) {
      throw new StorageException(
        "Bunny storage zone is required. Please provide a storage zone either through the constructor options or set the STORAGE_BUNNY_STORAGE_ZONE environment variable.",
      );
    }

    this.accessKey = accessKey;
    this.storageZone = storageZone;
    this.region = region ?? "de";
    this.baseUrl = `https://${REGION_ENDPOINTS[this.region]}`;
  }

  public getBucket(): string {
    return this.bucket;
  }

  public setBucket(name: string): this {
    this.bucket = name;

    return this;
  }

  public async list(): Promise<string[]> {
    const path = this.bucket ? `${this.bucket}/` : "";
    const url = `${this.baseUrl}/${this.storageZone}/${path}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        AccessKey: this.accessKey,
        accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new StorageException(`Failed to list files: ${response.status} ${response.statusText}`, {
        status: response.status,
        path,
      });
    }

    const files: BunnyFileInfoType[] = await response.json();

    return files.filter((file) => !file.IsDirectory).map((file) => file.ObjectName);
  }

  public async clearBucket(): Promise<this> {
    const keys = await this.list();

    await Promise.all(keys.map((key) => this.delete(key)));

    return this;
  }

  public async exists(key: string): Promise<boolean> {
    const url = this.buildFileUrl(key);

    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        AccessKey: this.accessKey,
      },
    });

    return response.ok;
  }

  public async delete(key: string): Promise<void> {
    const url = this.buildFileUrl(key);

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        AccessKey: this.accessKey,
      },
    });

    if (!response.ok && response.status !== 404) {
      throw new StorageException(`Failed to delete file: ${response.status} ${response.statusText}`, {
        status: response.status,
        key,
      });
    }
  }

  public async putFile(key: string, localPath: string): Promise<number> {
    const file = Bun.file(localPath);

    return await this.put(key, file);
  }

  public async putDir(bucket: string, options: PutDirOptionsType): Promise<number> {
    const { path, filter } = options;
    const entries = await readdir(path, { withFileTypes: true });

    const tasks: Promise<number>[] = [];

    for (const entry of entries) {
      const entryLocalPath = join(path, entry.name);
      const entryKey = bucket ? `${bucket}/${entry.name}` : entry.name;

      if (filter && !filter.test(entryLocalPath)) {
        continue;
      }

      if (entry.isDirectory()) {
        const subOptions: PutDirOptionsType = { path: entryLocalPath };
        if (filter) {
          subOptions.filter = filter;
        }
        tasks.push(this.putDir(entryKey, subOptions));
      } else {
        tasks.push(this.putFile(entryKey, entryLocalPath));
      }
    }

    const results = await Promise.all(tasks);

    return results.reduce((sum, bytes) => sum + bytes, 0);
  }

  public async put(
    key: string,
    content: string | ArrayBufferView | ArrayBuffer | SharedArrayBuffer | Request | Response | BunFile | S3File | Blob,
  ): Promise<number> {
    const url = this.buildFileUrl(key);

    let body: BodyInit;
    let contentLength: number;

    if (typeof content === "string") {
      body = content;
      contentLength = new TextEncoder().encode(content).length;
    } else if (content instanceof ArrayBuffer) {
      body = new Blob([content]);
      contentLength = content.byteLength;
    } else if (content instanceof SharedArrayBuffer) {
      const uint8Array = new Uint8Array(content);
      const copiedArray = new Uint8Array(uint8Array.length);
      copiedArray.set(uint8Array);
      body = new Blob([copiedArray]);
      contentLength = content.byteLength;
    } else if (ArrayBuffer.isView(content)) {
      body = new Blob([new Uint8Array(content.buffer as ArrayBuffer, content.byteOffset, content.byteLength)]);
      contentLength = content.byteLength;
    } else if (content instanceof Blob) {
      body = content;
      contentLength = content.size;
    } else if (content instanceof Request || content instanceof Response) {
      const arrayBuffer = await content.arrayBuffer();
      body = new Blob([arrayBuffer]);
      contentLength = arrayBuffer.byteLength;
    } else if (typeof content === "object" && content !== null && "arrayBuffer" in content) {
      const fileContent = content as BunFile | S3File;
      const arrayBuffer = await fileContent.arrayBuffer();
      body = new Blob([arrayBuffer]);
      contentLength = arrayBuffer.byteLength;
    } else {
      throw new StorageException("Unsupported content type for upload", { key });
    }

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        AccessKey: this.accessKey,
        "Content-Type": "application/octet-stream",
      },
      body,
    });

    if (!response.ok) {
      throw new StorageException(`Failed to upload file: ${response.status} ${response.statusText}`, {
        status: response.status,
        key,
      });
    }

    return contentLength;
  }

  public async getFile(key: string, options: GetFileOptionsType): Promise<number> {
    const arrayBuffer = await this.getAsArrayBuffer(key);
    const filename = options.filename ?? basename(key);
    const localPath = join(options.outputDir, filename);

    return await Bun.write(localPath, arrayBuffer);
  }

  public async getAsJson<T = unknown>(key: string): Promise<T> {
    const url = this.buildFileUrl(key);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        AccessKey: this.accessKey,
      },
    });

    if (!response.ok) {
      throw new StorageException(`Failed to get file as JSON: ${response.status} ${response.statusText}`, {
        status: response.status,
        key,
      });
    }

    return await response.json();
  }

  public async getAsArrayBuffer(key: string): Promise<ArrayBuffer> {
    const url = this.buildFileUrl(key);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        AccessKey: this.accessKey,
      },
    });

    if (!response.ok) {
      throw new StorageException(`Failed to get file as ArrayBuffer: ${response.status} ${response.statusText}`, {
        status: response.status,
        key,
      });
    }

    return await response.arrayBuffer();
  }

  public getAsStream(key: string): ReadableStream {
    const url = this.buildFileUrl(key);
    const accessKey = this.accessKey;

    const { readable, writable } = new TransformStream();

    fetch(url, {
      method: "GET",
      headers: { AccessKey: accessKey },
    }).then((response) => {
      if (!response.ok) {
        writable.abort(
          new StorageException(`Failed to get file as stream: ${response.status} ${response.statusText}`, {
            status: response.status,
            key,
          }),
        );
        return;
      }

      if (!response.body) {
        writable.abort(new StorageException("Response body is null", { key }));
        return;
      }

      response.body.pipeTo(writable);
    });

    return readable;
  }

  private buildFileUrl(key: string): string {
    const path = this.bucket ? `${this.bucket}/${key}` : key;

    return `${this.baseUrl}/${this.storageZone}/${path}`;
  }
}
