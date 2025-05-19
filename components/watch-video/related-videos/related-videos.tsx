import { Fragment, useEffect, useRef, useState } from "react";
import styles from "./related-videos.module.scss";
import { useSearchList } from "@/lib/ui/hooks/useSearchList";
import VideoThumbnail from "@/lib/ui/components/video-thumbnail/video-thumbnail";
import VideoThumbnailLoader from "@/lib/ui/components/video-thumbnail-loader/video-thumbnail-loader";
import Link from "next/link";
import { IYoutubeSearchItem } from "@/lib/ui/models/youtube-search-list.model";
import { ytdAbbreviateNumber } from "@/lib/ui/pipes/abbreviate-number/abbreviate-number.pipe";
import { ytdTimeAgo } from "@/lib/ui/pipes/time-ago/time-ago.pipe";

interface Props {
  query?: string;
}

export default function RelatedVideos(props: Props) {
  const loaderItems = new Array(5).fill("item");
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const [localSearchItems, setLocalSearchItems] = useState<IYoutubeSearchItem[]>([]); 
  const { query } = props;
  const { fetchSeachItems, isSearchItemsLoading, searchItemsError } = useSearchList();

  const cachedResults = useRef<Map<string, IYoutubeSearchItem[]>>(new Map());

  useEffect(() => {
        if (!query) return;

        // Thêm 2 cách tìm kiếm: theo title và channelTitle
        const searchQueries = [
            query,
            `related to ${query}`
        ];

        const fetchAll = async () => {
            try {
                const results = await Promise.all(
                    searchQueries.map(q => 
                        cachedResults.current.has(q) 
                            ? cachedResults.current.get(q)!
                            : fetchSeachItems({ query: q, maxResults: 3 })
                    )
                );
                
                const merged = results.flat().filter((v, i, a) => 
                    a.findIndex(t => t.id?.videoId === v.id?.videoId) === i
                );
                
                setLocalSearchItems(merged.slice(0, 5));
            } catch (error) {
                console.error("Failed to fetch related videos:", error);
            }
        };

        fetchAll();
    }, [query, fetchSeachItems]);

  if (isSearchItemsLoading) {
    return (
      <div className={styles.videoList}>
        {Array.from({ length: 5 }).map((_, index) => (
          <div className={styles.thumbnailLoaderTemplate} key={index}>
            <VideoThumbnailLoader direction="vertical" />
          </div>
        ))}
      </div>
    );
  }

  if (searchItemsError) {
    return (
      <div className={styles.errorContainer}>
        Error loading related videos: {searchItemsError.message}
      </div>
    );
  }

  if (!localSearchItems || localSearchItems.length === 0) {
    // Sử dụng localSearchItems thay cho searchItems
    return <div className={styles.emptyContainer}>No related videos found</div>;
  }

  return (
    <Fragment>
      <div className={styles.host}>
        <div className={styles.videoList}>
          {localSearchItems?.map((video) => {
            // Sử dụng localSearchItems
            return (
              <Link
                href={`/watch?v=${video.id?.videoId}`}
                key={video.id?.videoId}
              >
                <div className={styles.videoItem}>
                  <div className={styles.videoItem__thumbnail}>
                    <VideoThumbnail searchItem={video} direction="vertical" />
                  </div>
                  <div className={styles.videoInfo}>
                  <h3 className={styles.videoTitle} title={video.snippet?.title}>
                    {video.snippet?.title}
                  </h3>
                  <p className={styles.videoChannel}>
                    {video.snippet?.channelTitle}
                  </p>
                  <div className={styles.videoMetadata}>
                    <span>
                      {ytdAbbreviateNumber(Number(video.statistics?.viewCount || 0))} views
                    </span>
                    <span>•</span>
                    <span>
                      {ytdTimeAgo(video.snippet?.publishedAt)}
                    </span>
                  </div>
                </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </Fragment>
  );
}
