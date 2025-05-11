import Layout from '@/components/layout/layout';
import '@/styles/globals.scss';
import type { AppProps } from 'next/app';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store from '@/store';
import { persistStore } from 'redux-persist';
import DarkThemeProvider from '@/providers/dark-theme-provider/dark-theme-provider';
import MiniPlayerWrapper from '@/components/mini-player-wrapper/mini-player-wrapper';
import { StyledEngineProvider } from '@mui/material/styles';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps }: AppProps) {
  const [persistor, setPersistor] = useState<any>(null);

  useEffect(() => {
    const ps = persistStore(store);
    setPersistor(ps);
  }, []);  

  return (
    <Provider store={store}>
      {persistor ? (
        <PersistGate loading={null} persistor={persistor}>
          <StyledEngineProvider injectFirst>
            <DarkThemeProvider>
              <Layout>
                <Component {...pageProps} />
                <MiniPlayerWrapper />
              </Layout>
            </DarkThemeProvider>
          </StyledEngineProvider>
        </PersistGate>
      ) : (
        <Component {...pageProps} />
      )}
    </Provider>
  );
}
