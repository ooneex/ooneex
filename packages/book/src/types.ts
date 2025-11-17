import type { ICategory } from "@ooneex/category";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { IBase } from "@ooneex/types";

export interface IAuthor extends IBase {
  firstName: string;
  lastName: string;
  fullName?: string;
  bio?: string;
  birthDate?: string;
  deathDate?: string;
  nationality?: string;
}

export interface IPublisher extends IBase {
  name: string;
  address?: string;
  website?: string;
  foundedYear?: number;
}

export interface IBook extends IBase {
  title: string;
  subtitle?: string;
  authors?: IAuthor[];
  isbn?: string;
  isbn13?: string;
  publisher?: IPublisher;
  publishedDate?: string;
  description?: string;
  pageCount?: number;
  category?: ICategory;
  genres?: string[];
  // File info
  size?: number;
  url?: string;
  coverImage?: string;
  // Rating and reviews
  averageRating?: number;
  ratingsCount?: number;
  // Metadata
  edition?: string;
  series?: string;
  seriesVolume?: number;
  tags?: ITag[];
  status?: IStatus;
}
