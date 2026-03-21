import type { IStatus } from "@ooneex/status";
import type { IBase } from "@ooneex/types";

export interface IFolder extends IBase {
  name: string;
  color?: string;
  description?: string;
  parent?: IFolder;
  children?: IFolder[];
  context?: string;
  contextId?: string;
}

export interface IFolderShared extends IBase {
  folder?: IFolder;
  folderId?: string;
  sharedWith?: string;
  sharedById?: string;
  permission?: string;
  expiresAt?: string;
}

export interface IFolderLiked extends IBase {
  folder?: IFolder;
  folderId?: string;
  likedBy?: string;
  likedById?: string;
}

export interface IFolderComment extends IBase {
  folder?: IFolder;
  folderId?: string;
  comment: string;
  commentedBy?: string;
  commentedById?: string;
  parentCommentId?: string;
}

export interface IFolderDisliked extends IBase {
  folder?: IFolder;
  folderId?: string;
  dislikedBy?: string;
  dislikedById?: string;
}

export interface IFolderSaved extends IBase {
  folder?: IFolder;
  folderId?: string;
  savedBy?: string;
  savedById?: string;
}

export interface IFolderReport extends IBase {
  folder?: IFolder;
  folderId?: string;
  reason: string;
  description?: string;
  reportedBy?: string;
  reportedById?: string;
  status?: IStatus;
}

export interface IFolderDownloaded extends IBase {
  folder?: IFolder;
  folderId?: string;
  downloadedBy?: string;
  downloadedById?: string;
}

export interface IFolderViewed extends IBase {
  folder?: IFolder;
  folderId?: string;
  viewedBy?: string;
  viewedById?: string;
}

export interface IFolderStat extends IBase {
  folder?: IFolder;
  folderId?: string;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  savesCount?: number;
  downloadsCount?: number;
  viewsCount?: number;
  reportsCount?: number;
}
