import styles from "./search-box.module.scss";
import { Search } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchList } from "../../hooks/useSearchList";
import { Subject, from, of } from "rxjs";
import { catchError, debounceTime, distinctUntilChanged, switchMap } from "rxjs/operators";
import { IYoutubeSearchItem } from "../../models/youtube-search-list.model";
import { CircularProgress } from "@mui/material";

interface Props {
  placeholder?: string;
  minChars?: number;
  onSearch: (value: string) => void;
}

export default function SearchBox(props: Props) {
  const { placeholder, minChars = 3, onSearch } = props;

  const [inputValue, setInputValue] = useState<string>("");
  const [options, setOptions] = useState<IYoutubeSearchItem[]>([]);
  const { fetchSeachItems, isSearchItemsLoading } = useSearchList();
  const optionSelected$ = useRef(new Subject<string>());
  const [open, setOpen] = useState(false);

  // Xử lý search khi nhấn Enter
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter" && inputValue.trim().length >= minChars) {
        onSearch(inputValue);
        setOpen(false);
      }
    },
    [inputValue, minChars, onSearch]
  );

  // Xử lý search khi chọn từ dropdown
  const handleChange = useCallback(
    (event: any, value: IYoutubeSearchItem | string | null) => {
      if (!value) return;

      if (typeof value === "string") {
        onSearch(value);
      } else {
        onSearch(value.snippet?.title || "");
      }
      setOpen(false);
    },
    [onSearch]
  );

  // Xử lý search khi nhập liệu
  useEffect(() => {
    const sub = optionSelected$.current
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((val) => {
          if (!val.trim() || val.length < minChars) {
            setOptions([]);
            return of([]);
          }

          return from(fetchSeachItems({ query: val })).pipe(
            catchError((err) => {
              console.error("Search error:", err);
              return of([]);
            })
          );
        })
      )
      .subscribe({
        next: (data) => {
          // Ensure data is always an array
          const safeData = Array.isArray(data) ? data : [];
          setOptions(safeData);
          setOpen(safeData.length > 0 && inputValue.length >= minChars);
        },
      });

    return () => sub.unsubscribe();
  }, [fetchSeachItems, minChars, inputValue]);

  // Cập nhật search term khi input thay đổi
  useEffect(() => {
    optionSelected$.current.next(inputValue);
  }, [inputValue]);

  return (
    <div className={styles.host}>
      <div className={styles.searchboxWrapper}>
        <div className={styles.searchboxField}>
          <Autocomplete
            fullWidth
            disablePortal
            sx={{
              width: "100%",
              maxWidth: "100%",
              "& .MuiInputBase-root": {
                padding: "0 !important",
              },
            }}
            freeSolo
            options={options}
            getOptionLabel={(option) => {
              if (typeof option === "string") return option;
              return option.snippet?.title || "";
            }}
            inputValue={inputValue}
            onInputChange={(_, newValue) => setInputValue(newValue)}
            onChange={handleChange}
            disableClearable
            loading={isSearchItemsLoading}
            filterOptions={(x) => x}
            open={open}
            onOpen={() =>
              setOpen(inputValue.length >= minChars && options.length > 0)
            }
            onClose={() => setOpen(false)}
            noOptionsText={
              inputValue.length >= minChars
                ? isSearchItemsLoading
                  ? "Đang tìm kiếm..."
                  : "Không tìm thấy kết quả"
                : `Nhập ít nhất ${minChars} ký tự`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label={placeholder}
                onKeyDown={handleKeyDown}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isSearchItemsLoading ? (
                        <CircularProgress color="inherit" size={20} />
                      ) : null}
                      <div className={styles.searchboxIcon}>
                        <Search />
                      </div>
                    </>
                  ),
                }}
              />
            )}
          />
        </div>
      </div>
    </div>
  );
}
