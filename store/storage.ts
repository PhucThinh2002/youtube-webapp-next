const isClient = typeof window !== 'undefined';

const storage = isClient
  ? require('redux-persist/lib/storage').default
  : {
      getItem: () => Promise.resolve(null),
      setItem: () => Promise.resolve(),
      removeItem: () => Promise.resolve(),
    };

export default storage;
