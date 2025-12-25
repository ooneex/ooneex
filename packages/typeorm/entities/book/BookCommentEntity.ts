import type { IBook, IBookComment } from "@ooneex/book";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { BookEntity } from "./BookEntity";

@Entity({
  name: "books_comments",
})
export class BookCommentEntity extends BaseEntity implements IBookComment {
  @ManyToOne(() => BookEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "book_id" })
  book?: IBook;

  @Column({ name: "book_id", type: "varchar", length: 25, nullable: true })
  bookId?: string;

  @Column({ name: "comment", type: "text" })
  comment: string;

  @Column({ name: "commented_by", type: "varchar", length: 255, nullable: true })
  commentedBy?: string;

  @Column({ name: "commented_by_id", type: "varchar", length: 25, nullable: true })
  commentedById?: string;

  @Column({ name: "parent_comment_id", type: "varchar", length: 25, nullable: true })
  parentCommentId?: string;
}
