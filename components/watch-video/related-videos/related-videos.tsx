import { Fragment, useEffect, useState } from "react";
import styles from './related-videos.module.scss';
import { useSearchList } from "@/lib/ui/hooks/useSearchList";
import VideoThumbnail from "@/lib/ui/components/video-thumbnail/video-thumbnail";
import VideoThumbnailLoader from "@/lib/ui/components/video-thumbnail-loader/video-thumbnail-loader";
import Link from "next/link";

interface Props {
    query?: string;
}
export default function RelatedVideos(props: Props) {
    const loaderItems = new Array(5).fill('item');
    const [lastQuery, setLastQuery] = useState<string | null>(null);

    const { query } = props;
    const { fetchSeachItems, searchItems, isSearchItemsLoading, searchItemsError} = useSearchList();
    
    useEffect(() => {
      if (props.query && props.query !== lastQuery) {
        setLastQuery(props.query);
        fetchSeachItems({ query: props.query, maxResults: 5 });
      }
    }, [props.query, lastQuery, fetchSeachItems]);

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
        return <div className={styles.errorContainer}>Error loading related videos: {searchItemsError.message}</div>;
      }
    
      if (!searchItems || searchItems.length === 0) {
        return <div className={styles.emptyContainer}>No related videos found</div>;
      }

    return (
        <Fragment>
            <div className={styles.host}>
                <div className={styles.videoList}>
                    {searchItems?.map((video) => {
                        return (
                            <Link href={`/watch?v=${video.id?.videoId}`} key={video.id?.videoId}>
                                <div
                                    className={styles.videoItem}
                                >
                                    <div className={styles.videoItem__thumbnail}>
                                        <VideoThumbnail searchItem={video} direction="vertical" />
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