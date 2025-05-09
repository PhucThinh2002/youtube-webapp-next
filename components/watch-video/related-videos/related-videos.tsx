import { Fragment, useEffect, useRef, useState } from "react";
import styles from './related-videos.module.scss';
import { useSearchList } from "@/lib/ui/hooks/useSearchList";
import VideoThumbnail from "@/lib/ui/components/video-thumbnail/video-thumbnail";
import VideoThumbnailLoader from "@/lib/ui/components/video-thumbnail-loader/video-thumbnail-loader";
import Link from "next/link";
import { IYoutubeSearchItem } from "@/lib/ui/models/youtube-search-list.model";

interface Props {
    query?: string;
}

export default function RelatedVideos(props: Props) {
    const loaderItems = new Array(5).fill('item');
    const [lastQuery, setLastQuery] = useState<string | null>(null);
    const [localSearchItems, setLocalSearchItems] = useState<IYoutubeSearchItem[]>([]); // Thêm state local

    const { query } = props;
    const { fetchSeachItems, isSearchItemsLoading, searchItemsError } = useSearchList();
    
    const cachedResults = useRef<Map<string, IYoutubeSearchItem[]>>(new Map());

    useEffect(() => {
  // Thêm kiểm tra undefined
  if (!props.query || props.query === lastQuery) return;
  
  // TypeScript sẽ biết props.query là string tại đây
  const currentQuery = props.query;

  if (cachedResults.current.has(currentQuery)) {
    setLocalSearchItems(cachedResults.current.get(currentQuery)!);
    return;
  }

  setLastQuery(currentQuery);
  fetchSeachItems({ query: currentQuery, maxResults: 5 }).then(items => {
    cachedResults.current.set(currentQuery, items); // Đã đảm bảo currentQuery là string
    setLocalSearchItems(items);
  });
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
    
    if (!localSearchItems || localSearchItems.length === 0) { // Sử dụng localSearchItems thay cho searchItems
        return <div className={styles.emptyContainer}>No related videos found</div>;
    }

    return (
        <Fragment>
            <div className={styles.host}>
                <div className={styles.videoList}>
                    {localSearchItems?.map((video) => { // Sử dụng localSearchItems
                        return (
                            <Link href={`/watch?v=${video.id?.videoId}`} key={video.id?.videoId}>
                                <div className={styles.videoItem}>
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