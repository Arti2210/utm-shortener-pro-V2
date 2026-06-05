import React from 'react';

interface FormSectionProps {
  baseUrl: string;
  campaignName: string;
  onBaseUrlChange: (url: string) => void;
  onCampaignChange: (name: string) => void;
  error: string | null;
  fieldErrors?: { baseUrl?: string; campaign?: string };
  urlError?: string | null;
  campaignError?: string | null;
  t: (key: any) => string;
}

export default function FormSection({
  baseUrl,
  campaignName,
  onBaseUrlChange,
  onCampaignChange,
  error,
  fieldErrors,
  urlError,
  campaignError,
  t,
}: FormSectionProps) {
  return (
    <div className="space-y-5 sm:space-y-6">
      <div>
        <label
          htmlFor="base-url"
          className="block text-sm font-semibold mb-2 text-ink-700 dark:text-ink-100"
        >
          {t('baseUrl')}
        </label>
        <input
          id="base-url"
          type="url"
          value={baseUrl}
          onChange={(e) => onBaseUrlChange(e.target.value)}
          placeholder={t('baseUrlPlaceholder')}
          aria-invalid={!!(fieldErrors?.baseUrl || urlError)}
          aria-describedby="base-url-error"
          className={`w-full px-4 py-3 bg-ink-50 dark:bg-ink-900 border rounded-xl text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:ring-2 transition ${
            fieldErrors?.baseUrl || urlError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
              : 'border-ink-200 dark:border-ink-700 focus:border-teal-500 focus:ring-teal-500/20'
          }`}
        />
        {(fieldErrors?.baseUrl || urlError) && (
          <p id="base-url-error" className="text-xs text-red-500 mt-1.5">
            {fieldErrors?.baseUrl || urlError}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="campaign-name"
          className="block text-sm font-semibold mb-2 text-ink-700 dark:text-ink-100"
        >
          {t('campaignName')}
        </label>
        <input
          id="campaign-name"
          type="text"
          value={campaignName}
          onChange={(e) => onCampaignChange(e.target.value)}
          placeholder={t('campaignNamePlaceholder')}
          aria-invalid={!!(fieldErrors?.campaign || campaignError)}
          aria-describedby="campaign-hint campaign-error"
          className={`w-full px-4 py-3 bg-ink-50 dark:bg-ink-900 border rounded-xl text-ink-900 dark:text-white placeholder:text-ink-400 focus:outline-none focus:ring-2 transition ${
            fieldErrors?.campaign || campaignError
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20'
              : 'border-ink-200 dark:border-ink-700 focus:border-teal-500 focus:ring-teal-500/20'
          }`}
        />
        <div className="flex justify-between items-start mt-1.5">
          <p id="campaign-hint" className="text-xs text-ink-500 dark:text-ink-400">
            {t('campaignHint')}
          </p>
        </div>
        {(fieldErrors?.campaign || campaignError) && (
          <p id="campaign-error" className="text-xs text-red-500 mt-1">
            {fieldErrors?.campaign || campaignError}
          </p>
        )}
      </div>

      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 px-4 py-2.5 rounded-lg border border-red-500/20">
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
