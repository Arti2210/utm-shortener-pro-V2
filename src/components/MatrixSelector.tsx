import React from 'react';
import {
  PLATFORMS,
  MEDIUMS,
  isValidCombination,
  useAppStore,
} from '../store/appStore';

interface MatrixSelectorProps {
  combinationsCount: number;
  t: (key: any) => string;
}

export default function MatrixSelector({ combinationsCount, t }: MatrixSelectorProps) {
  const selectedPlatforms = useAppStore((s) => s.selectedPlatforms);
  const selectedMediums = useAppStore((s) => s.selectedMediums);
  const togglePlatform = useAppStore((s) => s.togglePlatform);
  const toggleMedium = useAppStore((s) => s.toggleMedium);
  const selectAllPlatforms = useAppStore((s) => s.selectAllPlatforms);
  const clearAllPlatforms = useAppStore((s) => s.clearAllPlatforms);
  const selectAllMediums = useAppStore((s) => s.selectAllMediums);
  const clearAllMediums = useAppStore((s) => s.clearAllMediums);

  const totalPossible = PLATFORMS.length * MEDIUMS.length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-sm text-ink-400 dark:text-ink-300">
          {t('matrixDescription')}
        </p>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-700/10 dark:bg-teal-500/10 border border-teal-700/30 dark:border-teal-500/30">
            <span className="font-semibold text-teal-700 dark:text-teal-300">
              {combinationsCount}
            </span>
            <span className="text-ink-500 dark:text-ink-300">
              / {totalPossible} {t('combinationsWillBeGenerated')}
            </span>
          </span>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200 dark:border-ink-700">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr>
              <th className="p-3 text-xs font-semibold text-left text-ink-500 dark:text-ink-300 bg-ink-50 dark:bg-ink-800 border-b border-r border-ink-200 dark:border-ink-700">
                <div className="flex items-center gap-2">
                  <span>{t('platforms')} ↓ / {t('mediums')} →</span>
                </div>
              </th>
              {MEDIUMS.map((m) => (
                <th
                  key={m.code}
                  className="p-3 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-ink-50 dark:bg-ink-800 border-b border-ink-200 dark:border-ink-700"
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>{m.name}</span>
                    {m.availableFor && m.availableFor.length > 0 && (
                      <span className="text-[10px] uppercase tracking-wider text-copper-500">
                        YT only
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map((p) => (
              <tr key={p.code}>
                <th className="p-3 text-xs font-semibold text-left text-ink-700 dark:text-ink-100 bg-ink-50/60 dark:bg-ink-800/60 border-r border-ink-200 dark:border-ink-700 whitespace-nowrap">
                  <button
                    onClick={() => togglePlatform(p.code)}
                    className={`w-full text-left px-2 py-1 rounded transition ${
                      selectedPlatforms.includes(p.code)
                        ? 'bg-teal-700 text-white'
                        : 'hover:bg-ink-100 dark:hover:bg-ink-700'
                    }`}
                  >
                    {p.name}
                  </button>
                </th>
                {MEDIUMS.map((m) => {
                  const valid = isValidCombination(p.code, m.code);
                  const rowSelected = selectedPlatforms.includes(p.code);
                  const colSelected = selectedMediums.includes(m.code);
                  const cellSelected = rowSelected && colSelected && valid;
                  const cellDisabled = !valid;

                  return (
                    <td
                      key={`${p.code}-${m.code}`}
                      className="p-2 border-t border-ink-200 dark:border-ink-700 text-center"
                    >
                      <button
                        onClick={() => {
                          if (cellDisabled) return;
                          if (!rowSelected) togglePlatform(p.code);
                          if (!colSelected) toggleMedium(m.code);
                          if (rowSelected && colSelected) {
                            togglePlatform(p.code);
                            toggleMedium(m.code);
                          }
                        }}
                        disabled={cellDisabled}
                        aria-label={`${p.name} - ${m.name}`}
                        className={`
                          w-10 h-10 rounded-lg flex items-center justify-center
                          transition-all duration-150 mx-auto
                          ${
                            cellDisabled
                              ? 'bg-ink-100 dark:bg-ink-800 text-ink-300 dark:text-ink-600 cursor-not-allowed'
                              : cellSelected
                              ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white shadow-md scale-105'
                              : 'bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-900/20'
                          }
                        `}
                        title={
                          cellDisabled
                            ? `${m.name} доступно тільки для YouTube`
                            : `${p.name} × ${m.name}`
                        }
                      >
                        {cellDisabled ? (
                          <span className="text-xs">—</span>
                        ) : cellSelected ? (
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-xs text-ink-400 dark:text-ink-500">
                            {p.code[0]}
                            {m.code[0]}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={selectAllPlatforms}
          className="text-xs px-3 py-1.5 rounded-md bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-100 border border-ink-200 dark:border-ink-700 transition"
        >
          {t('selectAll')} ({t('platforms')})
        </button>
        <button
          onClick={clearAllPlatforms}
          className="text-xs px-3 py-1.5 rounded-md bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-100 border border-ink-200 dark:border-ink-700 transition"
        >
          {t('clearAll')} ({t('platforms')})
        </button>
        <div className="w-px bg-ink-200 dark:bg-ink-700 mx-1" />
        <button
          onClick={selectAllMediums}
          className="text-xs px-3 py-1.5 rounded-md bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-100 border border-ink-200 dark:border-ink-700 transition"
        >
          {t('selectAll')} ({t('mediums')})
        </button>
        <button
          onClick={clearAllMediums}
          className="text-xs px-3 py-1.5 rounded-md bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-100 border border-ink-200 dark:border-ink-700 transition"
        >
          {t('clearAll')} ({t('mediums')})
        </button>
      </div>
    </div>
  );
}
