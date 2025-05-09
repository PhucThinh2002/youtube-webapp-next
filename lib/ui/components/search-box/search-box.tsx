import styles from './search-box.module.scss';
import { Search } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import Autocomplete from '@mui/material/Autocomplete';
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSearchList } from '../../hooks/useSearchList';
import { Subject, from, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap } from 'rxjs/operators';
import { IYoutubeSearchItem } from '../../models/youtube-search-list.model';
import { CircularProgress } from '@mui/material';

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
    const [open, setOpen] = useState(false);

    const getOptionLabel = useCallback((option: IYoutubeSearchItem | string): string => {
        if (typeof option === 'string') return option;
        const title = option.snippet?.title;
        // console.log('Label:', title); // 👈 Xem log ở đây
        return title || 'Không có tiêu đề';
    }, []);    

    // Hàm xử lý khi chọn kết quả
    const handleSelection = useCallback((value: IYoutubeSearchItem | string) => {
        inputChangeHandler(value);
        setOpen(false); // Chỉ đóng dropdown
        // KHÔNG tự động cập nhật inputValue ở đây
    }, [inputChangeHandler]);


    // Hàm xử lý nhấn phím Enter
    const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            setOpen(false); // Chỉ đóng dropdown khi nhấn Enter
            // KHÔNG tự động chọn item nào
        }
    }, []);

    useEffect(() => {
  const sub = optionSelected$.current
    .pipe(
      debounceTime(800), // Tăng từ 500 lên 800ms
      distinctUntilChanged(),
      filter(val => val.length >= minChars && val !== inputValue),
      switchMap((val) => {
        if (!val.trim()) return of([]);
        return from(fetchSeachItems({ query: val })).pipe(
          catchError(() => of([]))
        );
      })
    )
    .subscribe({
      next: (data: IYoutubeSearchItem[]) => {
        setOptions(data);
      }
    });

  return () => sub.unsubscribe();
}, [fetchSeachItems, minChars, inputValue]);

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
                    // sx={{ 
                    //     height: '100%', 
                    //     fontSize: '1.4rem',
                    //     '& .MuiAutocomplete-inputRoot': {
                    //     paddingRight: '40px !important'
                    //     }
                    // }}
                    // Thêm các props sau
                    open={open}
                    onOpen={() => {
                        setOpen(inputValue.length >= minChars)
                    }}
                    onClose={() => setOpen(false)} // Xử lý khi đóng dropdown
                    noOptionsText={inputValue.length >= minChars ? "Không tìm thấy kết quả" : `Nhập ít nhất ${minChars} ký tự`}
                    renderOption={(props, option) => {
                        if (typeof option === 'string') {
                            return <li {...props} key={option}>{option}</li>;
                        }
                        return (
                            <li {...props} key={option.id?.videoId || option.snippet?.title}>
                                {getOptionLabel(option)}
                            </li>
                        );
                    }}
                    onChange={(event: any, newValue: IYoutubeSearchItem | string) => {
                        if (newValue) {
                            handleSelection(newValue);
                        }
                    }}
                    onInputChange={(event, newInputValue) => {
                        setInputValue(newInputValue);
                        // Tự động mở dropdown khi đủ ký tự
                        setOpen(newInputValue.length >= minChars);
                    }}
                    renderInput={(params) => (
                        <TextField 
                            {...params} 
                            label={placeholder}
                            onKeyDown={handleKeyDown} // Thêm xử lý nhấn phím
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {isSearchItemsLoading ? (
                                            <CircularProgress color="inherit" size={20} />
                                        ) : null}
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