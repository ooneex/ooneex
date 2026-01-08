import type { IBook, IBookStat } from "@ooneex/book";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { BookEntity } from "./BookEntity";

@Entity({
  name: "books_stats",
})
export class BookStatEntity extends BaseEntity implements IBookStat {
  @ManyToOne(() => BookEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "book_id" })
  book?: IBook;

  @Column({ name: "book_id", type: "varchar", length: 25, nullable: true })
  bookId?: string;

  @Column({ name: "likes_count", type: "int", default: 0, nullable: true })
  likesCount?: number;

  @Column({ name: "dislikes_count", type: "int", default: 0, nullable: true })
  dislikesCount?: number;

  @Column({ name: "comments_count", type: "int", default: 0, nullable: true })
  commentsCount?: number;

  @Column({ name: "shares_count", type: "int", default: 0, nullable: true })
  sharesCount?: number;

  @Column({ name: "saves_count", type: "int", default: 0, nullable: true })
  savesCount?: number;

  @Column({ name: "downloads_count", type: "int", default: 0, nullable: true })
  downloadsCount?: number;

  @Column({ name: "views_count", type: "int", default: 0, nullable: true })
  viewsCount?: number;

  @Column({ name: "reports_count", type: "int", default: 0, nullable: true })
  reportsCount?: number;
}
