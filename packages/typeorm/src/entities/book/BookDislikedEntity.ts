import type { IBook, IBookDisliked } from "@ooneex/book";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { BookEntity } from "./BookEntity";

@Entity({
  name: "books_disliked",
})
export class BookDislikedEntity extends BaseEntity implements IBookDisliked {
  @ManyToOne(() => BookEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "book_id" })
  book?: IBook;

  @Column({ name: "book_id", type: "varchar", length: 25, nullable: true })
  bookId?: string;

  @Column({ name: "disliked_by", type: "varchar", length: 255, nullable: true })
  dislikedBy?: string;

  @Column({ name: "disliked_by_id", type: "varchar", length: 25, nullable: true })
  dislikedById?: string;
}
