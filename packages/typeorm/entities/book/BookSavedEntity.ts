import type { IBook, IBookSaved } from "@ooneex/book";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { BookEntity } from "./BookEntity";

@Entity({
  name: "books_saved",
})
export class BookSavedEntity extends BaseEntity implements IBookSaved {
  @ManyToOne(() => BookEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "book_id" })
  book?: IBook;

  @Column({ name: "book_id", type: "varchar", length: 25, nullable: true })
  bookId?: string;

  @Column({ name: "saved_by", type: "varchar", length: 255, nullable: true })
  savedBy?: string;

  @Column({ name: "saved_by_id", type: "varchar", length: 25, nullable: true })
  savedById?: string;
}
