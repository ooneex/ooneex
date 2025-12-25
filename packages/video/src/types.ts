import type { ICategory } from "@ooneex/category";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { IBase } from "@ooneex/types";

export enum EVideoResolution {
  RES_240P = "240p",
  RES_360P = "360p",
  RES_480P = "480p",
  RES_720P = "720p",
  RES_1080P = "1080p",
  RES_1440P = "1440p",
  RES_2160P = "2160p",
  RES_4K = "4K",
  RES_8K = "8K",
  HD = "HD",
  FULL_HD = "Full HD",
  ULTRA_HD = "Ultra HD",
  RES_1920x1080 = "1920x1080",
  RES_1280x720 = "1280x720",
  RES_854x480 = "854x480",
  RES_640x360 = "640x360",
  RES_426x240 = "426x240",
  RES_2560x1440 = "2560x1440",
  RES_3840x2160 = "3840x2160",
  RES_7680x4320 = "7680x4320",
}

export type VideoResolutionType = `${EVideoResolution}`;

export enum EVideoQuality {
  QUAL_240P = "240p",
  QUAL_360P = "360p",
  QUAL_480P = "480p",
  QUAL_720P = "720p",
  QUAL_1080P = "1080p",
  QUAL_1440P = "1440p",
  QUAL_2160P = "2160p",
  QUAL_4K = "4K",
  QUAL_8K = "8K",
  HD = "HD",
  FULL_HD = "Full HD",
  ULTRA_HD = "Ultra HD",
  SD = "SD",
  LOW = "Low",
  MEDIUM = "Medium",
  HIGH = "High",
  ULTRA_HIGH = "Ultra High",
}

export type VideoQualityType = `${EVideoQuality}`;

export enum EVideoFormat {
  MP4 = "mp4",
  MKV = "mkv",
  AVI = "avi",
  MOV = "mov",
  WMV = "wmv",
  FLV = "flv",
  WEBM = "webm",
  M4V = "m4v",
  THREE_GP = "3gp",
  OGV = "ogv",
  TS = "ts",
  M2TS = "m2ts",
  MTS = "mts",
  VOB = "vob",
  ASF = "asf",
  RM = "rm",
  RMVB = "rmvb",
  F4V = "f4v",
  MPG = "mpg",
  MPEG = "mpeg",
  MP2 = "mp2",
  MPE = "mpe",
  MPV = "mpv",
  M2V = "m2v",
}

export type VideoFormatType = `${EVideoFormat}`;

export enum EVideoCodec {
  H264 = "H.264",
  H265 = "H.265",
  H266 = "H.266",
  VP8 = "VP8",
  VP9 = "VP9",
  AV1 = "AV1",
  HEVC = "HEVC",
  AVC = "AVC",
  MPEG4 = "MPEG-4",
  MPEG2 = "MPEG-2",
  MPEG1 = "MPEG-1",
  XVID = "XviD",
  DIVX = "DivX",
  WMV = "WMV",
  THEORA = "Theora",
  PRORES = "ProRes",
  DNXHD = "DNxHD",
  MJPEG = "MJPEG",
}

export type VideoCodecType = `${EVideoCodec}`;

export enum EAudioCodec {
  AAC = "AAC",
  MP3 = "MP3",
  DTS = "DTS",
  DTS_HD = "DTS-HD",
  DOLBY_DIGITAL = "Dolby Digital",
  DOLBY_DIGITAL_PLUS = "Dolby Digital Plus",
  DOLBY_ATMOS = "Dolby Atmos",
  FLAC = "FLAC",
  ALAC = "ALAC",
  OGG = "OGG",
  VORBIS = "Vorbis",
  OPUS = "Opus",
  PCM = "PCM",
  WAV = "WAV",
  AC3 = "AC-3",
  EAC3 = "EAC-3",
  TRUE_HD = "TrueHD",
  WMA = "WMA",
}

export type AudioCodecType = `${EAudioCodec}`;

export enum EAudioChannels {
  MONO = "mono",
  STEREO = "stereo",
  TWO_ONE = "2.1",
  FIVE_ONE = "5.1",
  SIX_ONE = "6.1",
  SEVEN_ONE = "7.1",
  SEVEN_ONE_FOUR = "7.1.4",
  NINE_ONE = "9.1",
  ELEVEN_ONE = "11.1",
  TWENTY_TWO_TWO = "22.2",
}

export type AudioChannelsType = `${EAudioChannels}`;

export interface IVideo extends IBase {
  title: string;
  subtitle?: string;
  releaseDate?: string;
  description?: string;
  duration?: number;
  category?: ICategory;
  genres?: string[];
  // File info
  size?: number;
  url?: string;
  posterImage?: string;
  thumbnailImage?: string;
  // Video technical details
  resolution?: EVideoResolution;
  quality?: EVideoQuality;
  format?: EVideoFormat;
  codec?: EVideoCodec;
  bitrate?: number;
  frameRate?: number;
  // Audio details
  audioCodec?: AudioCodecType;
  audioChannels?: AudioChannelsType;
  // Rating and reviews
  averageRating?: number;
  ratingsCount?: number;
  contentRating?: string; // e.g., "G", "PG", "PG-13", "R", "NC-17"
  tags?: ITag[];
  status?: IStatus;
  context?: string;
  contextId?: string;
  isYoutube: boolean;
}

export interface IPlaylist extends IBase {
  name: string;
  description?: string;
  videos?: IVideo[];
  tags?: ITag[];
  status?: IStatus;
}

export interface IVideoProgress extends IBase {
  video?: IVideo;
  userId: string;
  currentTime: number;
  duration?: number;
  completed?: boolean;
  lastWatched?: string;
}

export interface IVideoShared extends IBase {
  video?: IVideo;
  videoId?: string;
  sharedWith?: string;
  sharedById?: string;
  permission?: string;
  expiresAt?: string;
}

export interface IVideoLiked extends IBase {
  video?: IVideo;
  videoId?: string;
  likedBy?: string;
  likedById?: string;
}

export interface IVideoComment extends IBase {
  video?: IVideo;
  videoId?: string;
  comment: string;
  commentedBy?: string;
  commentedById?: string;
  parentCommentId?: string;
}

export interface IVideoDisliked extends IBase {
  video?: IVideo;
  videoId?: string;
  dislikedBy?: string;
  dislikedById?: string;
}

export interface IVideoSaved extends IBase {
  video?: IVideo;
  videoId?: string;
  savedBy?: string;
  savedById?: string;
}

export interface IVideoReport extends IBase {
  video?: IVideo;
  videoId?: string;
  reason: string;
  description?: string;
  reportedBy?: string;
  reportedById?: string;
  status?: IStatus;
}

export interface IVideoDownloaded extends IBase {
  video?: IVideo;
  videoId?: string;
  downloadedBy?: string;
  downloadedById?: string;
}

export interface IVideoViewed extends IBase {
  video?: IVideo;
  videoId?: string;
  viewedBy?: string;
  viewedById?: string;
}

export interface IVideoStat extends IBase {
  video?: IVideo;
  videoId?: string;
  likesCount?: number;
  dislikesCount?: number;
  commentsCount?: number;
  sharesCount?: number;
  savesCount?: number;
  downloadsCount?: number;
  viewsCount?: number;
  reportsCount?: number;
}
