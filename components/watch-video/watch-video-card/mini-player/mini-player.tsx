import { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setIsMiniPlayerMode, setMiniPlayerVideo } from '@/store/reducers/video.reducer';
import VideoPlayer from '@/lib/ui/components/video-player/video-player';
import styles from './watch-video-card.module.scss';

export const MiniPlayer = () => {
  const dispatch = useAppDispatch();
  const { isMiniPlayerMode, miniPlayerVideo } = useAppSelector(state => state.video);
  const playerRef = useRef<HTMLDivElement>(null);

  const closeMiniPlayer = () => {
    dispatch(setIsMiniPlayerMode(false));
    dispatch(setMiniPlayerVideo(null));
  };

  const restorePlayer = () => {
    // Implement restore logic if needed
    closeMiniPlayer();
  };

  if (!isMiniPlayerMode || !miniPlayerVideo) return null;

  return (
    <div 
      ref={playerRef}
      className={styles.miniPlayer}
      style={{
        width: miniPlayerVideo.width,
        height: miniPlayerVideo.height,
        right: miniPlayerVideo.position.x,
        bottom: miniPlayerVideo.position.y
      }}
    >
      <VideoPlayer 
        videoId={miniPlayerVideo.videoId} 
        startSeconds={miniPlayerVideo.startSeconds}
        width={miniPlayerVideo.width}
        height={miniPlayerVideo.height}
      />
      <div className={styles.miniPlayer__controls}>
        <button onClick={restorePlayer}>↗</button>
        <button onClick={closeMiniPlayer}>×</button>
      </div>
    </div>
  );
};