import { IYoutubePageInfo, IYoutubeThumbnailDetail } from './youtube-common.model';

export interface IYoutubeVideoResult {
  items: any;
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    tags?: string[];
  };
  contentDetails: {
    duration: string;
  };
  statistics: {
    viewCount: string;
    likeCount: string;
    dislikeCount?: string;
    commentCount?: string;
  };
}

export interface IYoutubeVideoItem {
  kind?: string;
  etag?: string;
  id: string;
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
    tags?: string[];
  };
  contentDetails?: {
    duration: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
    dislikeCount?: string;
    commentCount?: string;
  };
}

export interface IYoutubeSearchItem {
  id: {
    videoId: string;
  };
  snippet: {
    title: string;
    description: string;
    channelTitle: string;
    publishedAt: string;
    thumbnails: {
      default: { url: string; width: number; height: number };
      medium: { url: string; width: number; height: number };
      high: { url: string; width: number; height: number };
    };
  };
}

export interface IYoutubeVideoThumbnail {
  default: IYoutubeThumbnailDetail;
  medium: IYoutubeThumbnailDetail;
  high: IYoutubeThumbnailDetail;
  standard: IYoutubeThumbnailDetail;
  maxres: IYoutubeThumbnailDetail;
}

interface Localized {
  title: string;
  description: string;
}

export interface IYoutubeVideoSnippet {
  publishedAt: Date;
  channelId: string;
  title: string;
  description: string;
  thumbnails: IYoutubeVideoThumbnail;
  channelTitle: string;
  tags: string[];
  categoryId: string;
  liveBroadcastContent: string;
  localized: Localized;
}

export interface IYoutubeContentDetails {
  duration: string;
  dimension: string;
  definition: string;
  caption: string;
  licensedContent: boolean;
  contentRating: any;
  projection: string;
}

export interface IYoutubeStatistics {
  viewCount: number;
  likeCount: string;
  favoriteCount: string;
  commentCount: string;
}