import { useState, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_KEY } from '@/app.constants';
import { IYoutubeVideoResult } from '../models/youtube-video-list.model';

export const useVideoList = () => {
    const [data, setData] = useState<IYoutubeVideoResult[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<AxiosError | null>(null);

    const fetchVideoItems = useCallback(async (params: { id: string }) => {
  const { id } = params;
  
  if (!id) return [];

  setIsLoading(true);
  setError(null);

  try {
    const response = await axios.get(`${API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: id,
        maxResults: 50, // Giới hạn tối đa
        key: API_KEY
      }
    });
    return response.data.items || [];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      setError(error);
    }
    return [];
  } finally {
    setIsLoading(false);
  }
}, []);

    return { fetchVideoItems, videoItems: data, isVideoItemsLoading: isLoading, videoItemsError: error };
};
