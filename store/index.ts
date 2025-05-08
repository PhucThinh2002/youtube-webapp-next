import { Action, ThunkAction, configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from 'redux-persist/lib/storage' // defaults to localStorage
import videoSlice from './reducers/video.reducer'
import settingsSlice from './reducers/settings.reducer'
import accountSlice from './reducers/account.reducer'

// Cấu hình persist cho account reducer
const accountPersistConfig = {
  key: 'account',
  storage,
  whitelist: ['watchedVideos', 'likedVideoList', 'dislikedVideoList']
}

const persistedAccountReducer = persistReducer(accountPersistConfig, accountSlice.reducer)

const store = configureStore({
  reducer: {
    video: videoSlice.reducer,
    settings: settingsSlice.reducer,
    account: persistedAccountReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export const persistor = persistStore(store)
export default store

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>