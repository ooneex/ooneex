import { describe, expect, test } from "bun:test";
import type { IAuthor, IBook, IBookStat, IPublisher } from "@/index";

describe("@ooneex/book - IAuthor", () => {
  test("should allow minimal author", () => {
    const author: IAuthor = {
      id: "author-1",
      firstName: "John",
      lastName: "Doe",
    };

    expect(author.firstName).toBe("John");
    expect(author.lastName).toBe("Doe");
    expect(author.fullName).toBeUndefined();
  });
});

describe("@ooneex/book - IPublisher", () => {
  test("should allow minimal publisher", () => {
    const publisher: IPublisher = {
      id: "pub-1",
      name: "Acme Publishing",
    };

    expect(publisher.name).toBe("Acme Publishing");
    expect(publisher.website).toBeUndefined();
  });
});

describe("@ooneex/book - IBook", () => {
  test("should allow minimal book with title", () => {
    const book: IBook = {
      id: "book-1",
      title: "Example Book",
    };

    expect(book.id).toBe("book-1");
    expect(book.title).toBe("Example Book");
    expect(book.authors).toBeUndefined();
  });

  test("should support authors, publisher, tags and status", () => {
    const author: IAuthor = {
      id: "author-1",
      firstName: "John",
      lastName: "Doe",
      fullName: "John Doe",
    };

    const publisher: IPublisher = {
      id: "pub-1",
      name: "Acme Publishing",
    };

    const book: IBook = {
      id: "book-2",
      title: "Advanced Testing",
      authors: [author],
      publisher,
      tags: [{ id: "tag-1", name: "testing" } as unknown as NonNullable<IBook["tags"]>[number]],
      status: { id: "status-1", status: "active" as never } as NonNullable<IBook["status"]>,
    };

    expect(book.authors).toHaveLength(1);
    expect(book.authors?.[0]?.fullName).toBe("John Doe");
    expect(book.publisher?.name).toBe("Acme Publishing");
    expect(book.tags?.[0]?.id).toBe("tag-1");
    expect(book.status?.id).toBe("status-1");
  });
});

describe("@ooneex/book - IBookStat", () => {
  test("should track engagement metrics", () => {
    const stats: IBookStat = {
      id: "stat-1",
      bookId: "book-1",
      likesCount: 10,
      dislikesCount: 1,
      commentsCount: 5,
      sharesCount: 2,
      savesCount: 3,
      downloadsCount: 4,
      viewsCount: 20,
      reportsCount: 0,
    };

    expect(stats.likesCount).toBe(10);
    expect(stats.dislikesCount).toBe(1);
    expect(stats.commentsCount).toBe(5);
    expect(stats.viewsCount).toBe(20);
  });
});
