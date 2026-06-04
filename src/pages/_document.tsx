import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="uk">
      <Head>
        <meta charSet="utf-8" />
        <link rel="icon" href="/logo.png" />
        <meta name="description" content="Professional UTM link generator and shortener for marketing and SMM specialists" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}