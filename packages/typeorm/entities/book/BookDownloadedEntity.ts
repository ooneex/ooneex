import type { IBook, IBookDownloaded } from "@ooneex/book";
import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../common/BaseEntity";
import { BookEntity } from "./BookEntity";

@Entity({
  name: "books_downloaded",
})
export class BookDownloadedEntity extends BaseEntity implements IBookDownloaded {
  @ManyToOne(() => BookEntity, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: "book_id" })
  book?: IBook;

  @Column({ name: "book_id", type: "varchar", length: 25, nullable: true })
  bookId?: string;

  @Column({ name: "downloaded_by", type: "varchar", length: 255, nullable: true })
  downloadedBy?: string;

  @Column({ name: "downloaded_by_id", type: "varchar", length: 25, nullable: true })
  downloadedById?: string;
}
