// store/index.ts
import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist'
import storage from './storage'
import videoSlice from './reducers/video.reducer'
import settingsSlice from './reducers/settings.reducer'
import accountSlice from './reducers/account.reducer'

const accountPersistConfig = {
  key: 'account',
  storage,
  whitelist: ['watchedVideos', 'likedVideoList', 'dislikedVideoList'],
}

const persistedAccountReducer = persistReducer(accountPersistConfig, accountSlice.reducer)

const store = configureStore({
  reducer: {
    video: videoSlice.reducer,
    settings: settingsSlice.reducer,
    account: persistedAccountReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
})

export default store
export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
