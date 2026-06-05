import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="uk">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" type="image/svg+xml" href="/logo.svg" />
        <meta
          name="description"
          content="Professional UTM link generator and shortener for marketing and SMM specialists"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var stored = JSON.parse(localStorage.getItem('utm-shortener-storage') || '{}');
                  var theme = (stored && stored.state && stored.state.theme) || 'dark';
                  var lang = (stored && stored.state && stored.state.language) || 'uk';
                  if (theme === 'dark') document.documentElement.classList.add('dark');
                  document.documentElement.lang = lang;
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </Head>
      <body className="bg-ink-50 dark:bg-ink-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
