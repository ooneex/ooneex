import type { IBook, IBookViewed } from "@ooneex/book";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { BookEntity } from "./BookEntity";

@Entity({
  name: "books_viewed",
})
export class BookViewedEntity extends BaseEntity implements IBookViewed {
  @ManyToOne(() => BookEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "book_id" })
  book?: IBook;

  @Column({ name: "book_id", type: "varchar", length: 25, nullable: true })
  bookId?: string;

  @Column({ name: "viewed_by", type: "varchar", length: 255, nullable: true })
  viewedBy?: string;

  @Column({ name: "viewed_by_id", type: "varchar", length: 25, nullable: true })
  viewedById?: string;
}
