import styles from './search-box.module.scss';
import { Search } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchList } from '../../hooks/useSearchList';
import { Subject, from } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { IYoutubeSearchItem } from '../../models/youtube-search-list.model';

interface Props {
    debouncePeriod?: number;
    placeholder?: string;
    minChars?: number;
    inputChangeHandler: (value: IYoutubeSearchItem | string) => void;
}

export default function SearchBox(props: Props) {
    const { 
        placeholder, 
        debouncePeriod = 500,
        minChars = 3,
        inputChangeHandler 
    } = props;
    
    const [inputValue, setInputValue] = useState<string>('');
    const [options, setOptions] = useState<IYoutubeSearchItem[]>([]);
    const { fetchSeachItems, isSearchItemsLoading } = useSearchList(); // Fixed typo here
    const optionSelected$ = useRef(new Subject<string>());

    const getOptionLabel = useCallback((option: IYoutubeSearchItem | string): string => {
        if (typeof option === 'string') return option;
        const title = option.snippet?.title;
        console.log('Label:', title); // 👈 Xem log ở đây
        return title || 'Không có tiêu đề';
    }, []);    

    useEffect(() => {
        const sub = optionSelected$.current
            .pipe(
                debounceTime(debouncePeriod),
                distinctUntilChanged(),
                filter(val => val.length >= minChars),
                switchMap((val) => {
                    if (!val.trim()) return from(Promise.resolve([]));
                  
                    return from(fetchSeachItems({ query: val })
                      .then((res: any) => {
                        console.log('Raw API response:', res); // 👈 Xem chi tiết phản hồi
                        if (Array.isArray(res)) return res;
                        if (Array.isArray(res?.data?.items)) return res.data.items;
                        return [];
                      })
                      .catch(() => []));
                  })                  
            )
            .subscribe({
                next: (data: IYoutubeSearchItem[]) => {
                    console.log('Fetched data:', data);
                    setOptions(data);
                },
                error: (err) => {
                    console.error('Search error:', err);
                    setOptions([]);
                }
            });
    
        return () => sub?.unsubscribe();
    }, [fetchSeachItems, debouncePeriod, minChars]);

    useEffect(() => {
        optionSelected$.current.next(inputValue);
    }, [inputValue]);

    return (
        <div className={styles.host}>
            <div className={styles.searchboxWrapper}>
                <div className={styles.searchboxField}>
                    <Autocomplete
                        freeSolo
                        options={options}
                        getOptionLabel={getOptionLabel}
                        disableClearable
                        loading={isSearchItemsLoading}
                        filterOptions={(x) => x}
                        sx={{ 
                            height: '100%', 
                            fontSize: '1.4rem',
                            '& .MuiAutocomplete-inputRoot': {
                                paddingRight: '40px !important'
                            }
                        }}
                        onChange={(event: any, newValue: IYoutubeSearchItem | string) => {
                            inputChangeHandler(newValue);
                        }}
                        onInputChange={(event, newInputValue) => {
                            setInputValue(newInputValue);
                        }}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                label={placeholder}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {params.InputProps.endAdornment}
                                            <div className={styles.searchboxIcon}>
                                                <Search />
                                            </div>
                                        </>
                                    )
                                }}
                            />
                        )}
                    />
                </div>
            </div>
        </div>
    );
}