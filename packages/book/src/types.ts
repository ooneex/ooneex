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
  context?: string;
  contextId?: string;
}

export interface IBookShared extends IBase {
  book?: IBook;
  bookId?: string;
  sharedWith?: string;
  sharedById?: string;
  permission?: string;
  expiresAt?: string;
}

export interface IBookLiked extends IBase {
  book?: IBook;
  bookId?: string;
  likedBy?: string;
  likedById?: string;
}

export interface IBookComment extends IBase {
  book?: IBook;
  bookId?: string;
  comment: string;
  commentedBy?: string;
  commentedById?: string;
  parentCommentId?: string;
}

export interface IBookDisliked extends IBase {
  book?: IBook;
  bookId?: string;
  dislikedBy?: string;
  dislikedById?: string;
}

export interface IBookSaved extends IBase {
  book?: IBook;
  bookId?: string;
  savedBy?: string;
  savedById?: string;
}

export interface IBookReport extends IBase {
  book?: IBook;
  bookId?: string;
  reason: string;
  description?: string;
  reportedBy?: string;
  reportedById?: string;
  status?: IStatus;
}

export interface IBookDownloaded extends IBase {
  book?: IBook;
  bookId?: string;
  downloadedBy?: string;
  downloadedById?: string;
}

export interface IBookViewed extends IBase {
  book?: IBook;
  bookId?: string;
  viewedBy?: string;
  viewedById?: string;
}

export interface IBookStat extends IBase {
  book?: IBook;
  bookId?: string;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  savesCount?: number;
  downloadsCount?: number;
  viewsCount?: number;
  reportsCount?: number;
}
