import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_KEY } from '@/app.constants';
import { IYoutubeVideoResult } from '../models/youtube-video-list.model';
import { IYoutubeVideoListParams } from '../models/youtube-video-list-params';

export const useVideoList = () => {
    const [data, setData] = useState<IYoutubeVideoResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AxiosError | null>(null);

    const fetchVideoItems = useCallback(async (params: IYoutubeVideoListParams) => {
        const { id } = params;
        if (!id || id === 'undefined') {
          return;
        }
        setIsLoading(true);
        setError(null);
      
        try {
          const response = await axios.get(`${API_BASE_URL}/videos`, {
            params: {
              part: 'snippet,contentDetails,statistics',
              id: id,
              key: API_KEY // Thêm API key vào đây
            }
          });
          setData(response.data.items); // YouTube API trả về items array
        } catch (error) {
          if (axios.isAxiosError(error)) {
            setError(error);
          } else {
            throw error;
          }
        } finally {
          setIsLoading(false);
        }
      }, []);

    return { fetchVideoItems, videoItems: data, isVideoItemsLoading: isLoading, videoItemsError: error };
};
