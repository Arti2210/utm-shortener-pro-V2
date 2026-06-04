import Head from 'next/head';
import { useAppStore } from '@/store/appStore';
import { t } from '@/i18n/translations';

export default function Home() {
  const language = useAppStore((state) => state.language);

  return (
    <>
      <Head>
        <title>UTM Shortener Pro</title>
        <meta name="description" content="Professional UTM link generator and shortener" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 py-8">
          {/* Header placeholder */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-4">
              {t('appName', language)}
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {language === 'uk'
                ? 'Генеруйте та скорочуйте UTM-посилання для ваших кампаній'
                : 'Generate and shorten UTM links for your campaigns'}
            </p>
          </div>

          {/* Main content placeholder */}
          <div className="card p-8 max-w-4xl mx-auto">
            <p className="text-center text-slate-600 dark:text-slate-400">
              {language === 'uk'
                ? 'Компоненти додаються...'
                : 'Components are being added...'}
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
