import { useState, useCallback, useDebugValue } from 'react';
import axios, { AxiosError } from 'axios';
import { API_BASE_URL, API_KEY } from '@/app.constants';
import { IYoutubeSearchItem } from '../models/youtube-search-list.model';
import { IYoutubeSearchParams } from '../models/youtube-video-list-params';

export const useSearchList = (minChars: number = 3) => {
  const [data, setData] = useState<IYoutubeSearchItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<AxiosError | null>(null);

 // Thêm log để kiểm tra API response
const fetchSeachItems = useCallback(async (params: IYoutubeSearchParams): Promise<IYoutubeSearchItem[]> => {
  console.log('API call with query:', params.query); // Xem query gọi API
  const { query, maxResults = 5 } = params;
  
  if (!query) {
    console.log('Empty query, returning empty array');
    return [];
  }
  
  console.log('Making API request for:', query);
  
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
    
    console.log('API response:', {
      status: response.status,
      data: response.data,
      itemsCount: response.data.items?.length || 0
    });
    
    const items = response.data.items || [];
    setData(items);
    return items;
  } catch (error) {
    console.error('Search API error:', error); // Thêm log
    if (axios.isAxiosError(error)) {
      setError(error);
    }
    return [];
  }
}, []);

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