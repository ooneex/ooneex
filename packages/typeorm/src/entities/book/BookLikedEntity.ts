import type { IBook, IBookLiked } from "@ooneex/book";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { BookEntity } from "./BookEntity";

@Entity({
  name: "books_liked",
})
export class BookLikedEntity extends BaseEntity implements IBookLiked {
  @ManyToOne(() => BookEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "book_id" })
  book?: IBook;

  @Column({ name: "book_id", type: "varchar", length: 25, nullable: true })
  bookId?: string;

  @Column({ name: "liked_by", type: "varchar", length: 255, nullable: true })
  likedBy?: string;

  @Column({ name: "liked_by_id", type: "varchar", length: 25, nullable: true })
  likedById?: string;
}
