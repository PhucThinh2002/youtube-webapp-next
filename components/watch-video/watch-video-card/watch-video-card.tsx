import { IYoutubeVideoItem } from "@/lib/ui/models/youtube-video-list.model";
import { Fragment, useEffect, useState } from "react";
import styles from "./watch-video-card.module.scss";
import { PictureInPictureAlt, Share, ThumbDown } from "@mui/icons-material";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import ThumbDownOffAltIcon from "@mui/icons-material/ThumbDownOffAlt";
import { ytdAbbreviateNumber } from "@/lib/ui/pipes/abbreviate-number/abbreviate-number.pipe";
import { Button, Divider } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectDislikedVideos, selectLikedVideos, toggleDislikeVideo, toggleLikeVideo } from "@/store/reducers/account.reducer";
import VideoPlayer from "@/lib/ui/components/video-player/video-player";
import VideoCardSecondaryInfo from "../video-card-secondary-info/video-card-secondary-info";
import VideoThumbnailLoader from "@/lib/ui/components/video-thumbnail-loader/video-thumbnail-loader";
import ShareVideoDialog from "./share-video-dialog/share-video-dialog";
import { setIsMiniPlayerMode, setMiniPlayerVideo } from "@/store/reducers/video.reducer";
import { useRouter } from "next/router";
import { useVideoList } from "@/lib/ui/hooks/useVideoList";
import { ytdTimeAgo } from "@/lib/ui/pipes/time-ago/time-ago.pipe";

interface Props {
  videoId: string | undefined;
  startSeconds?: number | undefined;
  videoResult: IYoutubeVideoItem | undefined;
}

export default function WatchVideoCard(props: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isShareDialogOpen, setIsShareDialogOpen] = useState<boolean>(false);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const { videoId, startSeconds, videoResult: propVideoResult } = props;
  const [localVideoResult, setLocalVideoResult] = useState<
    IYoutubeVideoItem | undefined
  >(propVideoResult);
  const { fetchVideoItems, videoItems, isVideoItemsLoading, videoItemsError } =
    useVideoList();
  const likedVideos = useAppSelector(selectLikedVideos);
  const dislikedVideos = useAppSelector(selectDislikedVideos);  
  const buttonStyles = {
    color: "var(--yt-spec-text-primary)",
  };

  useEffect(() => {
    if (!localVideoResult && videoId) {
      fetchVideoItems({ id: videoId }).then((items) => {
        if (items && items.length > 0) {
          setLocalVideoResult(items[0]);
        }
      });
    }
  }, [videoId, localVideoResult, fetchVideoItems]);

  useEffect(() => {
    if (!videoId) return;
    const url = `${location.host}/watch?v=${videoId}`;
    setVideoUrl(url);
  }, [videoId]);

  const videoResult = localVideoResult;

  const isLiked = (): boolean => {
    if (!videoId) {
      return false;
    }
    return likedVideos?.includes(videoId);
  };

  const isDisliked = (): boolean => {
    if (!videoId) {
      return false;
    }
    return dislikedVideos?.includes(videoId);
  };

  const onToggleLike = (): void => {
    dispatch(toggleLikeVideo({ videoId }));
  };

  const onToggleDisLike = (): void => {
    dispatch(toggleDislikeVideo({ videoId }));
  };

  const onMiniPlayerMode = (): void => {
    if (!videoId) return;
    
    // Get current video player dimensions
    const videoPlayer = document.querySelector(`.${styles.videoCard__player}`);
    const rect = videoPlayer?.getBoundingClientRect();
    
    dispatch(setMiniPlayerVideo({ 
      videoId,
      startSeconds: 0,
      width: rect?.width || 360,
      height: rect?.height || 202,
      position: { 
        x: window.innerWidth - (rect?.width || 360) - 20,
        y: 20
      }
    }));
    
    dispatch(setIsMiniPlayerMode(true));
  };

  if (isVideoItemsLoading) {
    return (
      <div className={styles.videoCardLoader}>
        <VideoThumbnailLoader direction="horizontal" />
      </div>
    );
  }

  if (videoItemsError) {
    return (
      <div className={styles.errorContainer}>
        Error loading video: {videoItemsError.message}
      </div>
    );
  }

  if (!videoResult) {
    return <div className={styles.emptyContainer}>No video data available</div>;
  }

  if (!videoResult?.snippet?.title) {
    return (
      <div className={styles.videoCardLoader}>
        <VideoThumbnailLoader direction="horizontal" />
      </div>
    );
  }

  return (
    <Fragment>
      <div className={styles.videoCard}>
        <div className={styles.videoCard__player}>
          <VideoPlayer videoId={videoId} startSeconds={startSeconds} />
        </div>

        <div className={styles.videoDetails}>
          {videoResult?.snippet?.tags?.length ? (
            <div className={styles.videoDetailsTags}>
              {videoResult.snippet.tags?.slice(0, 3).map((tag, tagIndex) => {
                return (
                  <div
                    className={`${styles.videoDetailsTag} mat-subtitle-2`}
                    key={tagIndex}
                  >
                    #{tag}
                  </div>
                );
              })}
            </div>
          ) : null}

          <div className={`${styles.videoDetails__title} mat-h2`}>
            {videoResult?.snippet?.title}
          </div>

          <div className={styles.videoDetails__footer}>
            <div className={`${styles.videoDetails__footer__views} mat-h3`}>
              <span> {ytdAbbreviateNumber(Number(videoResult?.statistics?.viewCount))} views </span>
              <span> • {ytdTimeAgo(videoResult?.snippet?.publishedAt)} </span>
            </div>

            <div className={styles.videoDetailsActions}>
              <Button
                sx={buttonStyles}
                className={styles.videoDetailsActions__item}
                onClick={onToggleLike}
              >
                {isLiked() && (
                  <ThumbUpIcon
                    className={styles.videoDetailsActions__item__icon}
                  />
                )}
                {!isLiked() && (
                  <ThumbUpOffAltIcon
                    className={styles.videoDetailsActions__item__icon}
                  />
                )}

                <p
                  className={`${styles.videoDetailsActions__item__text} mat-h3`}
                >
                  {ytdAbbreviateNumber(
                    Number(videoResult?.statistics?.likeCount),
                    0
                  )}{" "}
                  LIKES
                </p>
              </Button>

              <Button
                sx={buttonStyles}
                className={styles.videoDetailsActions__item}
                onClick={onToggleDisLike}
              >
                {isDisliked() && (
                  <ThumbDown
                    className={styles.videoDetailsActions__item__icon}
                  />
                )}
                {!isDisliked() && (
                  <ThumbDownOffAltIcon
                    className={styles.videoDetailsActions__item__icon}
                  />
                )}

                <p
                  className={`${styles.videoDetailsActions__item__text} mat-h3`}
                >
                  DISLIKE
                </p>
              </Button>

              <Button
                sx={buttonStyles}
                className={styles.videoDetailsActions__item}
                onClick={() => setIsShareDialogOpen(true)}
              >
                {<Share className={styles.videoDetailsActions__item__icon} />}

                <p
                  className={`${styles.videoDetailsActions__item__text} mat-h3`}
                >
                  SHARE
                </p>
              </Button>

              <ShareVideoDialog
                open={isShareDialogOpen}
                handleClose={() => setIsShareDialogOpen(false)}
                currenVideoTime={0}
                videoUrl={videoUrl}
              />

              <Button
                sx={buttonStyles}
                className={styles.videoDetailsActions__item}
                onClick={onMiniPlayerMode}
              >
                {
                  <PictureInPictureAlt
                    className={`${styles.videoDetailsActions__item__icon} flash`}
                  />
                }

                <p
                  className={`${styles.videoDetailsActions__item__text} mat-h3`}
                >
                  MINI PLAYER
                </p>
              </Button>
            </div>
          </div>
        </div>

        <Divider />

        {videoResult?.snippet?.description ? (
          <div className={styles.videoCard__secondaryInfo}>
            <VideoCardSecondaryInfo videoItem={videoResult} />
          </div>
        ) : null}
      </div>
    </Fragment>
  );
}