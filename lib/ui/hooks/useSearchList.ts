import { useState, useCallback, useDebugValue } from 'react';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_KEY } from '@/app.constants';
import { IYoutubeSearchItem } from '../models/youtube-search-list.model';
import { IYoutubeSearchParams } from '../models/youtube-video-list-params';

export const useSearchList = (minChars: number = 3) => {
  const [data, setData] = useState<IYoutubeSearchItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const fetchSeachItems = useCallback(async (params: IYoutubeSearchParams): Promise<IYoutubeSearchItem[]> => {
    const { query, maxResults = 5 } = params;
    
    if (!query || query.length < minChars) return []; // Thêm điều kiện kiểm tra độ dài
    
    setIsLoading(true);
    setError(null);
    setLastQuery(query);
  
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
      const items = response.data.items || [];
      setData(items);
      return items;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error);
      }
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [minChars]);

  const fetchVideosByIds = useCallback(async (ids: string[]): Promise<IYoutubeSearchItem[]> => {
  if (!ids.length) return [];
  
  setIsLoading(true);
  setError(null);

  try {
    const response = await axios.get(`${API_BASE_URL}/videos`, {
      params: {
        part: 'snippet,contentDetails,statistics',
        id: ids.join(','),
        maxResults: ids.length,
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

  return { 
    fetchSeachItems, 
    searchItems: data, 
    isSearchItemsLoading: isLoading, 
    searchItemsError: error,
    fetchVideosByIds 
  };
};