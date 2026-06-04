import React from 'react';

interface FormSectionProps {
  baseUrl: string;
  campaignName: string;
  onBaseUrlChange: (url: string) => void;
  onCampaignChange: (name: string) => void;
  error: string | null;
  t: (key: any) => string;
}

export default function FormSection({
  baseUrl,
  campaignName,
  onBaseUrlChange,
  onCampaignChange,
  error,
  t,
}: FormSectionProps) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2 text-[#cbd5e1]">
          {t('baseUrlLabel')}
        </label>
        <input
          type="url"
          value={baseUrl}
          onChange={(e) => onBaseUrlChange(e.target.value)}
          placeholder="https://example.com"
          className="w-full px-4 py-3 bg-[#0c1e3e] border border-[#fbbf24]/20 rounded-xl focus:outline-none focus:border-[#fbbf24] transition"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-[#cbd5e1]">
          {t('campaignLabel')}
        </label>
        <input
          type="text"
          value={campaignName}
          onChange={(e) => onCampaignChange(e.target.value)}
          placeholder={t('campaignPlaceholder')}
          className="w-full px-4 py-3 bg-[#0c1e3e] border border-[#fbbf24]/20 rounded-xl focus:outline-none focus:border-[#fbbf24] transition"
        />
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-500/10 px-4 py-2 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
}
