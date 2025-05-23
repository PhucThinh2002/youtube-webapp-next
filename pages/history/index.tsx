import { Fragment, useCallback, useEffect, useState } from "react";
import styles from "./index.module.scss";
import { Delete, DeleteOutline, Pause, Replay } from "@mui/icons-material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearWatchHistory, selectIsWatchHistoryEnabled, selectedWatchedVideos, toggleIsWatchHistoryEnabled } from "@/store/reducers/account.reducer";
import { IYoutubeSearchItem } from "@/lib/ui/models/youtube-search-list.model";
import { Observable, map, filter, forkJoin, finalize, from } from "rxjs";
import { useSearchList } from "@/lib/ui/hooks/useSearchList";
import VideoThumbnailLoader from "@/lib/ui/components/video-thumbnail-loader/video-thumbnail-loader";
import { Button } from "@mui/material";
import VideoThumbnail from "@/lib/ui/components/video-thumbnail/video-thumbnail";
import Link from "next/link";
import { useVideoList } from "@/lib/ui/hooks/useVideoList";

export default function HistoryPage() {
  const isWatchHistoryEnabled = useAppSelector(selectIsWatchHistoryEnabled);
  const watchedVideoIds = useAppSelector(selectedWatchedVideos);
  const dispatch = useAppDispatch();

  const [isLoading, setisLoading] = useState<boolean>(false);
  const [watchedVideos, setWatchedVideos] = useState<IYoutubeSearchItem[]>([]);
  const { fetchVideoItems } = useVideoList();

  const onClearWatchHistory = () => {
    dispatch(clearWatchHistory());
  };

  const onToggleWatchHistoryEnable = (enable: boolean) => {
    dispatch(toggleIsWatchHistoryEnabled(enable));
  };

  const getWatchedVideos = useCallback(
    async (videoIds: string[] | undefined) => {
      setWatchedVideos([]);
      setisLoading(true);

      if (!videoIds?.length) {
        setisLoading(false);
        return;
      }

      try {
        // Sửa ở đây - thêm await và type casting
        const response = (await fetchVideoItems({
          id: videoIds.join(","),
        })) as IYoutubeSearchItem[];
        setWatchedVideos(response);
      } catch (error) {
        console.error("Failed to fetch watched videos:", error);
        setWatchedVideos([]);
      } finally {
        setisLoading(false);
      }
    },
    [fetchVideoItems]
  );

  useEffect(() => {
    getWatchedVideos(watchedVideoIds);
  }, [watchedVideoIds, getWatchedVideos]);

  if (isLoading) {
    return (
      <Fragment>
        {watchedVideoIds?.map((item, index) => {
          return (
            <div className={styles.thumbnailLoaderTemplateItem} key={index}>
              <VideoThumbnailLoader direction="vertical" />
            </div>
          );
        })}
      </Fragment>
    );
  }

  if (!watchedVideoIds?.length) {
    return (
      <Fragment>
        {isWatchHistoryEnabled && (
          <div className={styles.emptyTemplate}>
            <div className={styles.emptyTemplate__header}>
              <DeleteOutline className={styles.emptyTemplateIcon} />
            </div>

            <div className={styles.emptyTemplate__text}>
              <h2 className="mat-h2">Empty Watch History</h2>
              <Link href="/">
                <p className="mat-h3"> Watch some videos </p>
              </Link>
            </div>
          </div>
        )}

        {!isWatchHistoryEnabled && (
          <div className={styles.emptyTemplate}>
            <div className={styles.emptyTemplate__header}>
              <Pause className={styles.emptyTemplateIcon} />
            </div>

            <div className={styles.emptyTemplate__text}>
              <h2 className="mat-h2">Watch History is Paused</h2>
              <h3 className="mat-h3">Enable Watch History</h3>
            </div>
          </div>
        )}
      </Fragment>
    );
  }
  return (
    <Fragment>
      <div className={styles.host}>
        <div className={styles.home}>
          <div className={styles.homePrimary}>
            <h2 className={`${styles.homePrimary__title} mat-h2`}>
              Watch History
            </h2>

            {watchedVideos?.map((video, videoIndex) => {
              return (
                <div className={styles.videoItem} key={videoIndex}>
                  <div className={styles.videoItem__thumbnail}>
                    <VideoThumbnail 
        searchItem={video} 
        direction="vertical"
        disableHistoryAdd={true} // Ngăn thêm trùng vào history
      />
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.homeSecondary}>
            <div className={styles.homeSecondary_actions}>
              <Button className={styles.secondaryAction}>
                <Delete className={styles.secondaryAction__icon} />
                <div
                  className={`${styles.secondaryAction__text} mat-h3`}
                  onClick={onClearWatchHistory}
                >
                  Clear All Watch History
                </div>
              </Button>

              {isWatchHistoryEnabled && (
                <Button className={styles.secondaryAction}>
                  <Pause className={styles.secondaryAction__icon} />
                  <div
                    className={`${styles.secondaryAction__text} mat-h3`}
                    onClick={() => onToggleWatchHistoryEnable(false)}
                  >
                    Pause Watch History
                  </div>
                </Button>
              )}
              {!isWatchHistoryEnabled && (
                <Button className={styles.secondaryAction}>
                  <Replay className={styles.secondaryAction__icon} />
                  <div
                    className={`${styles.secondaryAction__text} mat-h3`}
                    onClick={() => onToggleWatchHistoryEnable(true)}
                  >
                    Resume Watch History
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
