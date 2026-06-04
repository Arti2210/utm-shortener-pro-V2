import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  const { theme } = useAppStore();

  // Ensure theme is applied on initial load
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  return <Component {...pageProps} />;
}