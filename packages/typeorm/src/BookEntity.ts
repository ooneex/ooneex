import type { IAuthor, IBook, IPublisher } from "@ooneex/book";
import type { ICategory } from "@ooneex/category";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "./BaseEntity";
import { BookAuthorEntity } from "./BookAuthorEntity";
import { BookPublisherEntity } from "./BookPublisherEntity";
import { CategoryEntity } from "./CategoryEntity";
import { StatusEntity } from "./StatusEntity";
import { TagEntity } from "./TagEntity";

@Entity({
  name: "books",
})
export class BookEntity extends BaseEntity implements IBook {
  @Column({ name: "title", type: "varchar", length: 500 })
  title: string;

  @Column({ name: "subtitle", type: "varchar", length: 500, nullable: true })
  subtitle?: string;

  @ManyToMany(() => BookAuthorEntity, { eager: false, cascade: ["insert", "update"] })
  @JoinTable({
    name: "books_authors",
    joinColumn: { name: "book_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "author_id", referencedColumnName: "id" },
  })
  authors?: IAuthor[];

  @Column({ name: "isbn", type: "varchar", length: 13, nullable: true })
  isbn?: string;

  @Column({ name: "isbn13", type: "varchar", length: 17, nullable: true })
  isbn13?: string;

  @ManyToOne(() => BookPublisherEntity, { nullable: true, eager: false, cascade: ["insert", "update"] })
  @JoinColumn({ name: "publisher_id" })
  publisher?: IPublisher;

  @Column({ name: "published_date", type: "date", nullable: true })
  publishedDate?: string;

  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  @Column({ name: "page_count", type: "int", nullable: true })
  pageCount?: number;

  @ManyToOne(() => CategoryEntity, { nullable: true, eager: false, cascade: ["insert", "update"] })
  @JoinColumn({ name: "category_id" })
  category?: ICategory;

  @Column({ name: "genres", type: "json", nullable: true })
  genres?: string[];

  @Column({ name: "size", type: "bigint", nullable: true })
  size?: number;

  @Column({ name: "url", type: "text", nullable: true })
  url?: string;

  @Column({ name: "cover_image", type: "text", nullable: true })
  coverImage?: string;

  @Column({ name: "average_rating", type: "decimal", precision: 3, scale: 2, nullable: true })
  averageRating?: number;

  @Column({ name: "ratings_count", type: "int", nullable: true })
  ratingsCount?: number;

  @Column({ name: "edition", type: "varchar", length: 100, nullable: true })
  edition?: string;

  @Column({ name: "series", type: "varchar", length: 200, nullable: true })
  series?: string;

  @Column({ name: "series_volume", type: "int", nullable: true })
  seriesVolume?: number;

  @ManyToMany(() => TagEntity, { eager: false, cascade: ["insert", "update"] })
  @JoinTable({
    name: "books_tags",
    joinColumn: { name: "book_id", referencedColumnName: "id" },
    inverseJoinColumn: { name: "tag_id", referencedColumnName: "id" },
  })
  tags?: ITag[];

  @ManyToOne(() => StatusEntity, { nullable: true, eager: false, cascade: ["insert", "update"] })
  @JoinColumn({ name: "status_id" })
  status?: IStatus;
}
