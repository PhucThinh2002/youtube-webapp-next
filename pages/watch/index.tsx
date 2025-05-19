import RelatedVideos from "@/components/watch-video/related-videos/related-videos";
import WatchVideoCard from "@/components/watch-video/watch-video-card/watch-video-card";
import { Fragment, useEffect } from "react";
import styles from './index.module.scss';
import { useRouter } from "next/router";
import { useVideoList } from "@/lib/ui/hooks/useVideoList";
import { IYoutubeVideoItem } from "@/lib/ui/models/youtube-video-list.model";

export default function WatchVideo() {
    const router = useRouter();
    const { query } = router;
    const videoId = String(query.v);
    const startSeconds = Number(query.t);

    const { fetchVideoItems, videoItems } = useVideoList();
    // Sửa cách lấy videoInfo
    const videoInfo = videoItems?.find((result: IYoutubeVideoItem) => result.id === videoId);

    useEffect(() => {
        if (videoId) {
            fetchVideoItems({ id: videoId });
        }
    }, [videoId, fetchVideoItems]);

    return (
        <Fragment>
            <div className={styles.host}>
                <div className={styles.watchVideo}>
                    <div className={styles.videoCardWrapper}>
                        <WatchVideoCard 
                            videoId={videoId} 
                            startSeconds={startSeconds} 
                            videoResult={videoInfo} 
                        />
                    </div>
                    <div className={styles.relatedVideosWrapper}>
                        {/* Thêm fallback khi chưa có videoInfo */}
                        {videoInfo ? (
                            <RelatedVideos 
                                query={videoInfo.snippet?.title || videoInfo.snippet?.channelTitle} 
                            />
                        ) : (
                            <div>Loading related videos...</div>
                        )}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}