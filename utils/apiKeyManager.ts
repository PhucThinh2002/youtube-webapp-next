// utils/api-key-manager.ts
const API_KEYS = [
  process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_1,
  process.env.NEXT_PUBLIC_YOUTUBE_API_KEY_2,
].filter(Boolean) as string[];

type KeyStatus = {
  key: string;
  exhausted: boolean;
};

let keysStatus: KeyStatus[] = API_KEYS.map(key => ({ key, exhausted: false }));
let currentKeyIndex = 0;

function getNextValidKey(): string | null {
  // Find the first non-exhausted key
  const validKey = keysStatus.find(k => !k.exhausted);
  if (validKey) {
    currentKeyIndex = keysStatus.indexOf(validKey);
    return validKey.key;
  }
  return null;
}

export function getCurrentApiKey(): string {
  const currentKey = keysStatus[currentKeyIndex];
  if (!currentKey.exhausted) {
    return currentKey.key;
  }
  
  const nextKey = getNextValidKey();
  if (nextKey) {  
    console.log(`Switched to API key ${currentKeyIndex + 1}`);
    return nextKey;
  }
  
  throw new Error('All API keys have been exhausted');
}

export function markKeyExhausted(key: string): void {
  const keyStatus = keysStatus.find(k => k.key === key);
  if (keyStatus) {
    keyStatus.exhausted = true;
    console.log(`Marked API key as exhausted`);
  }
}

export function hasAvailableKeys(): boolean {
  return keysStatus.some(k => !k.exhausted);
}