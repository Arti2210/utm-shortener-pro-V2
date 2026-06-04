import React from 'react';

interface MatrixSelectorProps {
  combinationsCount: number;
  t: (key: any) => string;
}

export default function MatrixSelector({ combinationsCount, t }: MatrixSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="text-sm text-[#cbd5e1]">
        {t('selectedCombinations')}: <span className="font-semibold text-[#fbbf24]">{combinationsCount}</span>
      </div>
      <div className="text-xs text-[#64748b]">
        {t('matrixDescription')}
      </div>
    </div>
  );
}
