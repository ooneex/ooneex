import type { IBook, IBookShared } from "@ooneex/book";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { BookEntity } from "./BookEntity";

@Entity({
  name: "books_shared",
})
export class BookSharedEntity extends BaseEntity implements IBookShared {
  @ManyToOne(() => BookEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "book_id" })
  book?: IBook;

  @Column({ name: "book_id", type: "varchar", length: 25, nullable: true })
  bookId?: string;

  @Column({ name: "shared_with", type: "varchar", length: 255, nullable: true })
  sharedWith?: string;

  @Column({ name: "shared_by_id", type: "varchar", length: 25, nullable: true })
  sharedById?: string;

  @Column({ name: "permission", type: "varchar", length: 50, nullable: true })
  permission?: string;

  @Column({ name: "expires_at", type: "timestamptz", nullable: true })
  expiresAt?: string;
}
