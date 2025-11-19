import type { ICategory } from "@ooneex/category";
import type { IStatus } from "@ooneex/status";
import type { ITag } from "@ooneex/tag";
import type { IBase } from "@ooneex/types";

export type VideoResolutionType =
  | "240p"
  | "360p"
  | "480p"
  | "720p"
  | "1080p"
  | "1440p"
  | "2160p"
  | "4K"
  | "8K"
  | "HD"
  | "Full HD"
  | "Ultra HD"
  | "1920x1080"
  | "1280x720"
  | "854x480"
  | "640x360"
  | "426x240"
  | "2560x1440"
  | "3840x2160"
  | "7680x4320";

export type VideoQualityType =
  | "240p"
  | "360p"
  | "480p"
  | "720p"
  | "1080p"
  | "1440p"
  | "2160p"
  | "4K"
  | "8K"
  | "HD"
  | "Full HD"
  | "Ultra HD"
  | "SD"
  | "Low"
  | "Medium"
  | "High"
  | "Ultra High";

export type VideoFormatType =
  | "mp4"
  | "mkv"
  | "avi"
  | "mov"
  | "wmv"
  | "flv"
  | "webm"
  | "m4v"
  | "3gp"
  | "ogv"
  | "ts"
  | "m2ts"
  | "mts"
  | "vob"
  | "asf"
  | "rm"
  | "rmvb"
  | "f4v"
  | "mpg"
  | "mpeg"
  | "mp2"
  | "mpe"
  | "mpv"
  | "m2v";

export type VideoCodecType =
  | "H.264"
  | "H.265"
  | "H.266"
  | "VP8"
  | "VP9"
  | "AV1"
  | "HEVC"
  | "AVC"
  | "MPEG-4"
  | "MPEG-2"
  | "MPEG-1"
  | "XviD"
  | "DivX"
  | "WMV"
  | "Theora"
  | "ProRes"
  | "DNxHD"
  | "MJPEG";

export type AudioCodecType =
  | "AAC"
  | "MP3"
  | "DTS"
  | "DTS-HD"
  | "Dolby Digital"
  | "Dolby Digital Plus"
  | "Dolby Atmos"
  | "FLAC"
  | "ALAC"
  | "OGG"
  | "Vorbis"
  | "Opus"
  | "PCM"
  | "WAV"
  | "AC-3"
  | "EAC-3"
  | "TrueHD"
  | "WMA";

export type AudioChannelsType = "mono" | "stereo" | "2.1" | "5.1" | "6.1" | "7.1" | "7.1.4" | "9.1" | "11.1" | "22.2";

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
  resolution?: VideoResolutionType;
  quality?: VideoQualityType;
  format?: VideoFormatType;
  codec?: VideoCodecType;
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
