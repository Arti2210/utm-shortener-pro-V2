import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import '@/styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    // Apply theme to document
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }, [theme]);

  return <Component {...pageProps} />;
}
