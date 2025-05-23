import { Fragment, useCallback, useEffect, useMemo, useRef, useState,} from "react";
import styles from "./browse-videos.module.scss";
import MiniSidebar from "../mini-sidebar/mini-sidebar";
import { IYoutubeVideoItem } from "@/lib/ui/models/youtube-video-list.model";
import VideoThumbnail from "@/lib/ui/components/video-thumbnail/video-thumbnail";
import { useAppSelector } from "@/store/hooks";
import { selectSearchQuery } from "@/store/reducers/video.reducer";
import { useSearchList } from "@/lib/ui/hooks/useSearchList";
import { useVideoList } from "@/lib/ui/hooks/useVideoList";
import BrowserVideosLoader from "./browse-videos-loader/browse-videos-loader";
import BrowseVideosEmpty from "./browse-videos-empty/browse-videos-empty";
import BrowseVideosError from "./browse-videos-error/browse-videos-error";
import Link from "next/link";
import { debounce } from "lodash";
import { IYoutubeSearchItem } from "@/lib/ui/models/youtube-search-list.model";

export default function BrowserVideos() {
  const [videoIds, setVideoIds] = useState<string | undefined>();
  const [lastSearchQuery, setLastSearchQuery] = useState<string>("");
  const searchCache = useRef<Map<string, IYoutubeSearchItem[]>>(new Map());
  const searchQuery = useAppSelector(selectSearchQuery);
  const [localSearchItems, setLocalSearchItems] = useState<IYoutubeSearchItem[] | null>(null);

  const { fetchSeachItems, searchItems, isSearchItemsLoading, searchItemsError } = useSearchList();

  const { fetchVideoItems, videoItems, isVideoItemsLoading, videoItemsError } = useVideoList();

  // Sử dụng useRef cho debounce function để tránh recreate mỗi lần render
  const debouncedSearchRef = useRef(
    debounce((query: string) => {
      if (query.trim() && query !== lastSearchQuery) {
        if (searchCache.current.has(query)) {
          setLocalSearchItems(searchCache.current.get(query)!); // Sử dụng setLocalSearchItems
          return;
        }
        setLastSearchQuery(query);
        fetchSeachItems({ query }).then((data) => {
          searchCache.current.set(query, data);
          setLocalSearchItems(data); // Sử dụng setLocalSearchItems
        });
      }
    }, 600)
  );

  // Tối ưu: Memoize video details để tránh tính toán lại
  const videoDetailsMap = useMemo(() => {
    const map = new Map<string, IYoutubeVideoItem>();
    videoItems?.forEach((videoItem) => {
      videoItem?.items?.forEach((item: IYoutubeVideoItem) => {
        if (item?.id) map.set(item.id, item);
      });
    });
    return map;
  }, [videoItems]);

  const getVideoDetail = useCallback(
    (id: string | undefined): IYoutubeVideoItem | undefined => {
      return id ? videoDetailsMap.get(id) : undefined;
    },
    [videoDetailsMap]
  );

  useEffect(() => {
    // Cleanup debounce khi component unmount
    return () => {
      debouncedSearchRef.current.cancel();
    };
  }, []);

  useEffect(() => {
    // Gọi debounce khi searchQuery thay đổi
    debouncedSearchRef.current(searchQuery);
  }, [searchQuery]);

  // Thay tất cả searchItems bằng localSearchItems
  useEffect(() => {
    const newVideoIds = localSearchItems
      ?.map((item) => item.id?.videoId)
      .filter(Boolean)
      .join(",");

    if (newVideoIds && newVideoIds !== videoIds) {
      setVideoIds(newVideoIds);
    }
  }, [localSearchItems, videoIds]);

  useEffect(() => {
    // Chỉ fetch video items khi videoIds thay đổi
    if (videoIds) {
      fetchVideoItems({ id: videoIds });
    }
  }, [videoIds, fetchVideoItems]);

  // Hiển thị trạng thái lỗi
  if (searchItemsError || videoItemsError) {
    return <BrowseVideosError />;
  }

  // Hiển thị trạng thái loading
  if (isSearchItemsLoading || isVideoItemsLoading) {
    return <BrowserVideosLoader />;
  }

  // Hiển thị khi không có kết quả 
  if (!searchItems?.length) {
    return <BrowseVideosEmpty />;
  }

  if (!localSearchItems?.length) {
    return <BrowseVideosEmpty />;
  }

  return (
    <Fragment>
      <div className={styles.browseVideos}>
        <div className={styles.browseVideos__sidenav}>
          <MiniSidebar className={styles.miniSidebarWrapper} />
        </div>

        <div className={styles.browseVideosList}>
          {localSearchItems.map((searchItem, index) => (
            <div
              className={styles.videoPlayer}
              key={`${searchItem.id?.videoId}-${index}`}
            >
              <Link
                href={{
                  pathname: "/watch",
                  query: {
                    v: searchItem.id?.videoId,
                  },
                }}
                passHref
              >
                <VideoThumbnail
                  searchItem={searchItem}
                  videoDetail={getVideoDetail(searchItem.id?.videoId)}
                  isNowPlaying={false}
                  direction="horizontal"
                />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Fragment>
  );
}
