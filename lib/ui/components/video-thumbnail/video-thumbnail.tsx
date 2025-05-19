import React, { Fragment, useState } from "react";
import styles from "./video-thumbnail.module.scss";
import { IYoutubeSearchItem } from "../../models/youtube-search-list.model";
import { IYoutubeVideoItem } from "../../models/youtube-video-list.model";
import { ytdAbbreviateNumber } from "../../pipes/abbreviate-number/abbreviate-number.pipe";
import { ytdTimeAgo } from "../../pipes/time-ago/time-ago.pipe";
import classNames from "classnames";
import Image from "next/image";
import { useAppDispatch } from "@/store/hooks";
import { addVideoToHistoryList } from "@/store/reducers/account.reducer";
import { useRouter } from "next/router";

interface Props {
  searchItem?: IYoutubeSearchItem;
  videoDetail?: IYoutubeVideoItem;
  direction?: "vertical" | "horizontal";
  isNowPlaying?: boolean;
  priority?: boolean;
  disableHistoryAdd?: boolean;
}

export default function VideoThumbnail(props: Props) {
  const [imageError, setImageError] = useState(false);
  const priority = props.priority || false;
  const direction = props.direction || "horizontal";

  const imageUrl = imageError
    ? "/default-thumbnail.jpg"
    : props.searchItem?.snippet?.thumbnails?.high?.url ||
      props.videoDetail?.snippet?.thumbnails?.high?.url;

  const viewCount = props.videoDetail?.statistics?.viewCount;

  const isNowPlaying = props.isNowPlaying;
  const duration = props.videoDetail?.contentDetails?.duration;

  const dispatch = useAppDispatch();
  const router = useRouter(); 
  
  
  const handleClick = (e: React.MouseEvent) => {
  e.preventDefault();
  
  // Lấy videoId từ searchItem hoặc videoDetail
  const videoId = 
    props.searchItem?.id?.videoId || // Cho YouTube Search API
    props.searchItem?.id ||          // Nếu id là string trực tiếp
    props.videoDetail?.id;           // Cho YouTube Video API

  if (!videoId) {
    console.error('No video ID found in:', props.searchItem, props.videoDetail);
    return;
  }

  if (!props.disableHistoryAdd) {
    dispatch(addVideoToHistoryList({ videoId }));
  }

  router.push(`/watch?v=${videoId}`)
    .catch(err => console.error('Navigation error:', err));
};

  const handleImageError = () => {
    setImageError(true);
  };

  const thumbnailClasses = classNames(`${styles.thumbnail}`, {
    [styles["thumbnail--vertical"]]: direction === "vertical",
    [styles["thumbnail--horizontal"]]: direction === "horizontal",
  });

  if (!props.searchItem && !props.videoDetail) {
    return (
      <div className={styles.videoThumbnailHost}>
        <div className={styles.thumbnailError}>
          <span>No video data available</span>
        </div>
      </div>
    );
  }

  return (
    <Fragment>
      <div className={styles.videoThumbnailHost} onClick={handleClick}>
        <div className={thumbnailClasses}>
          <div className={styles.thumbnail__image}>
            {imageUrl && (
              <Image
                src={imageUrl}
                alt="Video image"
                fill
                sizes="(min-width: 0) 100%, 100%"
                onError={handleImageError}
                priority={priority}
              />
            )}

            {duration && (
              <div className={styles.thumbnail__image__duration}>
                {duration}
              </div>
            )}

            <div className={styles.imageBackdrop}></div>
            {isNowPlaying && (
              <div className={styles.nowPlayingOverlay}>
                <div
                  className={`mat-subtitle-1 ${styles.nowPlayingOverlay__text}`}
                >
                  Now Playing
                </div>
                <div className={styles.nowPlayingOverlay__equalizer}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <rect
                      className={`${styles.eqBar} ${styles["eqBar--1"]}`}
                      x="0"
                      y="4"
                      width="4"
                      height="8"
                    />
                    <rect
                      className={`${styles.eqBar} ${styles["eqBar--2"]}`}
                      x="6"
                      y="4"
                      width="4"
                      height="16"
                    />
                    <rect
                      className={`${styles.eqBar} ${styles["eqBar--3"]}`}
                      x="12"
                      y="4"
                      width="4"
                      height="11"
                    />
                  </svg>
                </div>
              </div>
            )}
          </div>

          <div className={styles.thumbnailDetails}>
            <div className={styles.thumbnailDetails__icon}></div>
            <div className={styles.thumbnailDetailsContent}>
              <div className={styles.thumbnailDetailsContent}>
                <h3
                  className={`mat-h3 ${styles.thumbnailDetailsContent__title}`}
                  dangerouslySetInnerHTML={{
                    __html: props.searchItem?.snippet?.title as string,
                  }}
                ></h3>
                <h4
                  className={`${styles.thumbnailDetailsContent__channelTitle} mat-subtitle-2`}
                  dangerouslySetInnerHTML={{
                    __html: props.searchItem?.snippet?.channelTitle as string,
                  }}
                ></h4>
                <p
                  className={`${styles.thumbnailDetailsContent__footer} mat-h5`}
                >
                  {viewCount && (
                    <span>
                      {ytdAbbreviateNumber(Number(viewCount))} views •
                    </span>
                  )}
                  {ytdTimeAgo(props.searchItem?.snippet?.publishedAt)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
