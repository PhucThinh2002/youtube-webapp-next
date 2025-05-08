import { useState, useCallback, useDebugValue } from 'react';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_KEY } from '@/app.constants';
import { IYoutubeSearchItem } from '../models/youtube-search-list.model';
import { IYoutubeSearchParams } from '../models/youtube-video-list-params';

export const useSearchList = () => {
  const [data, setData] = useState<IYoutubeSearchItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const fetchSeachItems = useCallback(async (params: IYoutubeSearchParams) => {
    const { query, maxResults = 12 } = params;
    
    // Thêm điều kiện kiểm tra query trùng lặp
    if (!query || query === lastQuery) return;
    setLastQuery(query);
    
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/search`, {
        params: {
          part: 'snippet',
          q: query,
          maxResults,
          key: API_KEY,
          type: 'video'
        }
      });
      setData(response.data.items);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [lastQuery]);

  return { fetchSeachItems, searchItems: data, isSearchItemsLoading: isLoading, searchItemsError: error };
};