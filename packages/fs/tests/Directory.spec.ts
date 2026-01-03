import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { Directory, DirectoryException } from "@/index";

const TEST_DIR = "/tmp/ooneex-dir-test";
const SUB_DIR = `${TEST_DIR}/subdir`;
const NESTED_DIR = `${TEST_DIR}/level1/level2/level3`;

describe("Directory", () => {
  beforeEach(async () => {
    const { mkdir } = await import("node:fs/promises");
    await mkdir(TEST_DIR, { recursive: true });
    await mkdir(SUB_DIR, { recursive: true });
    await Bun.write(`${TEST_DIR}/file1.txt`, "content1");
    await Bun.write(`${TEST_DIR}/file2.txt`, "content2");
    await Bun.write(`${SUB_DIR}/nested.txt`, "nested content");
  });

  afterEach(async () => {
    const { rm } = await import("node:fs/promises");
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("constructor", () => {
    test("should create a Directory instance", () => {
      const dir = new Directory(TEST_DIR);
      expect(dir).toBeInstanceOf(Directory);
    });
  });

  describe("getPath", () => {
    test("should return the directory path", () => {
      const dir = new Directory(TEST_DIR);
      expect(dir.getPath()).toBe(TEST_DIR);
    });
  });

  describe("getName", () => {
    test("should return the directory name", () => {
      const dir = new Directory(TEST_DIR);
      expect(dir.getName()).toBe("ooneex-dir-test");
    });

    test("should return name for nested directory", () => {
      const dir = new Directory(SUB_DIR);
      expect(dir.getName()).toBe("subdir");
    });
  });

  describe("getParent", () => {
    test("should return the parent directory path", () => {
      const dir = new Directory(SUB_DIR);
      expect(dir.getParent()).toBe(TEST_DIR);
    });

    test("should return parent for root test directory", () => {
      const dir = new Directory(TEST_DIR);
      expect(dir.getParent()).toBe("/tmp");
    });
  });

  describe("exists", () => {
    test("should return true for existing directory", async () => {
      const dir = new Directory(TEST_DIR);
      expect(await dir.exists()).toBe(true);
    });

    test("should return false for non-existent directory", async () => {
      const dir = new Directory(`${TEST_DIR}/nonexistent`);
      expect(await dir.exists()).toBe(false);
    });

    test("should return false for file path", async () => {
      const dir = new Directory(`${TEST_DIR}/file1.txt`);
      expect(await dir.exists()).toBe(false);
    });
  });

  describe("create", () => {
    test("should create a new directory", async () => {
      const newDir = `${TEST_DIR}/newdir`;
      const dir = new Directory(newDir);
      await dir.create();
      expect(await dir.exists()).toBe(true);
    });

    test("should create nested directories with recursive option", async () => {
      const dir = new Directory(NESTED_DIR);
      await dir.create({ recursive: true });
      expect(await dir.exists()).toBe(true);
    });

    test("should not throw if directory already exists with recursive", async () => {
      const dir = new Directory(TEST_DIR);
      await dir.create({ recursive: true });
      expect(await dir.exists()).toBe(true);
    });
  });

  describe("delete", () => {
    test("should delete an empty directory", async () => {
      const emptyDir = `${TEST_DIR}/empty`;
      const dir = new Directory(emptyDir);
      await dir.create();
      expect(await dir.exists()).toBe(true);

      await dir.delete();
      expect(await dir.exists()).toBe(false);
    });

    test("should delete directory with contents recursively", async () => {
      const dir = new Directory(SUB_DIR);
      expect(await dir.exists()).toBe(true);

      await dir.delete({ recursive: true });
      expect(await dir.exists()).toBe(false);
    });

    test("should not throw with force option for non-existent directory", async () => {
      const dir = new Directory(`${TEST_DIR}/nonexistent`);
      await dir.delete({ force: true });
      expect(await dir.exists()).toBe(false);
    });
  });

  describe("list", () => {
    test("should list directory contents", async () => {
      const dir = new Directory(TEST_DIR);
      const contents = await dir.list();
      expect(contents).toContain("file1.txt");
      expect(contents).toContain("file2.txt");
      expect(contents).toContain("subdir");
    });

    test("should list contents recursively", async () => {
      const dir = new Directory(TEST_DIR);
      const contents = await dir.list({ recursive: true });
      expect(contents.length).toBeGreaterThan(3);
    });

    test("should throw for non-existent directory", async () => {
      const dir = new Directory(`${TEST_DIR}/nonexistent`);
      expect(dir.list()).rejects.toThrow(DirectoryException);
    });
  });

  describe("listWithTypes", () => {
    test("should list directory contents with type information", async () => {
      const dir = new Directory(TEST_DIR);
      const entries = await dir.listWithTypes();

      const fileEntry = entries.find((e) => e.name === "file1.txt");
      const dirEntry = entries.find((e) => e.name === "subdir");

      expect(fileEntry?.isFile()).toBe(true);
      expect(dirEntry?.isDirectory()).toBe(true);
    });

    test("should list contents recursively with types", async () => {
      const dir = new Directory(TEST_DIR);
      const entries = await dir.listWithTypes({ recursive: true });
      expect(entries.length).toBeGreaterThan(3);
    });
  });

  describe("copy", () => {
    test("should copy directory to destination", async () => {
      const sourceDir = new Directory(SUB_DIR);
      const destPath = `${TEST_DIR}/copied`;

      await sourceDir.copy(destPath);

      const destDir = new Directory(destPath);
      expect(await destDir.exists()).toBe(true);

      const contents = await destDir.list();
      expect(contents).toContain("nested.txt");
    });

    test("should copy directory recursively", async () => {
      const sourceDir = new Directory(TEST_DIR);
      const destPath = "/tmp/ooneex-dir-test-copy";

      await sourceDir.copy(destPath, { recursive: true });

      const destDir = new Directory(destPath);
      expect(await destDir.exists()).toBe(true);

      const contents = await destDir.list();
      expect(contents).toContain("subdir");

      await destDir.delete({ recursive: true });
    });
  });

  describe("move", () => {
    test("should move directory to new location", async () => {
      const moveDir = `${TEST_DIR}/tomove`;
      const destPath = `${TEST_DIR}/moved`;

      const { mkdir } = await import("node:fs/promises");
      await mkdir(moveDir);
      await Bun.write(`${moveDir}/file.txt`, "content");

      const dir = new Directory(moveDir);
      await dir.move(destPath);

      expect(await dir.exists()).toBe(false);

      const movedDir = new Directory(destPath);
      expect(await movedDir.exists()).toBe(true);
    });
  });

  describe("stat", () => {
    test("should return directory stats", async () => {
      const dir = new Directory(TEST_DIR);
      const stats = await dir.stat();

      expect(stats.isDirectory()).toBe(true);
      expect(stats.isFile()).toBe(false);
      expect(stats.mode).toBeDefined();
      expect(stats.mtime).toBeInstanceOf(Date);
    });

    test("should throw for non-existent directory", async () => {
      const dir = new Directory(`${TEST_DIR}/nonexistent`);
      expect(dir.stat()).rejects.toThrow(DirectoryException);
    });
  });

  describe("watch", () => {
    test("should return a watcher instance", () => {
      const dir = new Directory(TEST_DIR);
      const watcher = dir.watch(() => {});

      expect(watcher).toBeDefined();
      expect(typeof watcher.close).toBe("function");

      watcher.close();
    });

    test("should accept recursive option", () => {
      const dir = new Directory(TEST_DIR);
      const watcher = dir.watch(() => {}, { recursive: true });

      expect(watcher).toBeDefined();
      watcher.close();
    });
  });

  describe("isEmpty", () => {
    test("should return false for non-empty directory", async () => {
      const dir = new Directory(TEST_DIR);
      expect(await dir.isEmpty()).toBe(false);
    });

    test("should return true for empty directory", async () => {
      const emptyDir = `${TEST_DIR}/empty`;
      const dir = new Directory(emptyDir);
      await dir.create();

      expect(await dir.isEmpty()).toBe(true);
    });

    test("should throw for non-existent directory", async () => {
      const dir = new Directory(`${TEST_DIR}/nonexistent`);
      expect(dir.isEmpty()).rejects.toThrow(DirectoryException);
    });
  });

  describe("getSize", () => {
    test("should return total size of directory contents", async () => {
      const dir = new Directory(TEST_DIR);
      const size = await dir.getSize();

      expect(size).toBeGreaterThan(0);
    });

    test("should return 0 for empty directory", async () => {
      const emptyDir = `${TEST_DIR}/empty`;
      const dir = new Directory(emptyDir);
      await dir.create();

      const size = await dir.getSize();
      expect(size).toBe(0);
    });

    test("should include nested directory sizes", async () => {
      const dir = new Directory(TEST_DIR);
      const totalSize = await dir.getSize();

      const subDir = new Directory(SUB_DIR);
      const subSize = await subDir.getSize();

      expect(totalSize).toBeGreaterThan(subSize);
    });
  });
});

describe("DirectoryException", () => {
  test("should have correct name", () => {
    const exception = new DirectoryException("Test error");
    expect(exception.name).toBe("DirectoryException");
  });

  test("should have correct message", () => {
    const exception = new DirectoryException("Test error message");
    expect(exception.message).toBe("Test error message");
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new DirectoryException("Test", data);
    expect(Object.isFrozen(exception.data)).toBe(true);
  });

  test("should have default status 500", () => {
    const exception = new DirectoryException("Test");
    expect(exception.status).toBe(500);
  });
});
