import { describe, expect, mock, test } from "bun:test";
import { VectorTable } from "@/index";

const mockReranker = { rerank: mock() };

mock.module("@lancedb/lancedb", () => ({
  rerankers: {
    RRFReranker: {
      create: mock(() => Promise.resolve(mockReranker)),
    },
  },
  Index: {
    btree: mock(() => ({ type: "btree" })),
    bitmap: mock(() => ({ type: "bitmap" })),
    labelList: mock(() => ({ type: "labelList" })),
    ivfPq: mock(() => ({ type: "ivfPq" })),
  },
}));

type TestData = { category: string; score: number };

const createMockVectorQuery = () => {
  const query: Record<string, ReturnType<typeof mock>> = {};

  query.rerank = mock(() => query);
  query.limit = mock(() => query);
  query.nprobes = mock(() => query);
  query.refineFactor = mock(() => query);
  query.fastSearch = mock(() => query);
  query.select = mock(() => query);
  query.where = mock(() => query);
  query.toArray = mock(() => Promise.resolve([{ id: "1", text: "hello", category: "books", score: 9 }]));
  query.explainPlan = mock(() => Promise.resolve("ProjectionExec"));
  query.analyzePlan = mock(() => Promise.resolve("AnalyzePlan: 1ms"));

  return query;
};

const createMockTable = () => ({
  add: mock((..._args: unknown[]) => Promise.resolve()),
  createIndex: mock((..._args: unknown[]) => Promise.resolve()),
  search: mock((..._args: unknown[]) => createMockVectorQuery()),
});

describe("VectorTable", () => {
  describe("add", () => {
    test("should add data to the table", async () => {
      const mockTable = createMockTable();
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);
      const data = [{ id: "1", text: "hello", category: "books", score: 9 }];

      const result = await table.add(data);

      expect(mockTable.add).toHaveBeenCalledWith(data);
      expect(result).toBe(table);
    });
  });

  describe("createIndex", () => {
    test("should create a scalar index on a column", async () => {
      const mockTable = createMockTable();
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      const result = await table.createIndex("category");

      expect(mockTable.createIndex).toHaveBeenCalledWith("category", undefined);
      expect(result).toBe(table);
    });

    test("should create a scalar index with config options", async () => {
      const { Index } = await import("@lancedb/lancedb");
      const mockTable = createMockTable();
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);
      const config = { config: Index.btree() };

      const result = await table.createIndex("category", config);

      expect(mockTable.createIndex).toHaveBeenCalledWith("category", config);
      expect(result).toBe(table);
    });
  });

  describe("createVectorIndex", () => {
    test("should create IVF PQ vector index on default column", async () => {
      const mockTable = createMockTable();
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      const result = await table.createVectorIndex();

      expect(mockTable.createIndex).toHaveBeenCalled();
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const call = mockTable.createIndex.mock.lastCall as any[];
      expect(call?.[0]).toBe("vector");
      expect(result).toBe(table);
    });

    test("should create vector index on custom column", async () => {
      const mockTable = createMockTable();
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.createVectorIndex("custom_vector");

      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const call = mockTable.createIndex.mock.lastCall as any[];
      expect(call?.[0]).toBe("custom_vector");
    });
  });

  describe("search", () => {
    test("should perform hybrid search with defaults", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      const results = await table.search("hello world");

      expect(mockTable.search).toHaveBeenCalledWith("hello world", "hybrid", "text");
      expect(mockQuery.rerank).toHaveBeenCalled();
      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.fastSearch).toHaveBeenCalled();
      expect(mockQuery.toArray).toHaveBeenCalled();
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      expect(results).toEqual([{ id: "1", text: "hello", category: "books", score: 9 }] as any);
    });

    test("should apply custom limit", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.search("query", { limit: 5 });

      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });

    test("should apply select columns", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.search("query", { select: ["id", "category"] });

      expect(mockQuery.select).toHaveBeenCalledWith(["id", "category"]);
    });

    test("should apply filter", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.search("query", { filter: { field: "category", op: "=", value: "books" } });

      expect(mockQuery.where).toHaveBeenCalledWith("category = 'books'");
    });

    test("should apply nprobes option", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.search("query", { nprobes: 20 });

      expect(mockQuery.nprobes).toHaveBeenCalledWith(20);
    });

    test("should apply refineFactor option", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.search("query", { refineFactor: 10 });

      expect(mockQuery.refineFactor).toHaveBeenCalledWith(10);
    });

    test("should skip fastSearch when disabled", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.search("query", { fastSearch: false });

      expect(mockQuery.fastSearch).not.toHaveBeenCalled();
    });

    test("should not call select or where when not provided", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.search("query");

      expect(mockQuery.select).not.toHaveBeenCalled();
      expect(mockQuery.where).not.toHaveBeenCalled();
    });
  });

  describe("explainPlan", () => {
    test("should return query plan with defaults", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      const plan = await table.explainPlan("query");

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.explainPlan).toHaveBeenCalledWith(true);
      expect(plan).toBe("ProjectionExec");
    });

    test("should apply filter and custom options", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.explainPlan("query", {
        limit: 5,
        filter: { field: "score", op: ">", value: 3 },
        verbose: false,
      });

      expect(mockQuery.limit).toHaveBeenCalledWith(5);
      expect(mockQuery.where).toHaveBeenCalledWith("score > 3");
      expect(mockQuery.explainPlan).toHaveBeenCalledWith(false);
    });
  });

  describe("analyzePlan", () => {
    test("should return analyze plan with defaults", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      const plan = await table.analyzePlan("query");

      expect(mockQuery.limit).toHaveBeenCalledWith(10);
      expect(mockQuery.analyzePlan).toHaveBeenCalled();
      expect(plan).toBe("AnalyzePlan: 1ms");
    });

    test("should apply filter and custom limit", async () => {
      const mockTable = createMockTable();
      const mockQuery = createMockVectorQuery();
      mockTable.search.mockReturnValue(mockQuery);
      // biome-ignore lint/suspicious/noExplicitAny: test mock
      const table = new VectorTable<TestData>(mockTable as any);

      await table.analyzePlan("query", {
        limit: 20,
        filter: { field: "category", op: "LIKE", value: "%book%" },
      });

      expect(mockQuery.limit).toHaveBeenCalledWith(20);
      expect(mockQuery.where).toHaveBeenCalledWith("category LIKE '%book%'");
    });
  });
});
