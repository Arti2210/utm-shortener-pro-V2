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
  const isCellSelected = useAppStore((s) => s.isCellSelected);
  const toggleCell = useAppStore((s) => s.toggleCell);
  const selectAllCells = useAppStore((s) => s.selectAllCells);
  const clearAllCells = useAppStore((s) => s.clearAllCells);
  const togglePlatformColumn = useAppStore((s) => s.togglePlatformColumn);
  const togglePlacementRow = useAppStore((s) => s.togglePlacementRow);
  const selectedCells = useAppStore((s) => s.selectedCells);

  const totalPossible = PLATFORMS.reduce(
    (acc, p) =>
      acc + MEDIUMS.filter((m) => isValidCombination(p.code, m.code)).length,
    0
  );

  const isColumnFullySelected = (platform: string) => {
    const validMediums = MEDIUMS.filter((m) =>
      isValidCombination(platform, m.code)
    );
    return (
      validMediums.length > 0 &&
      validMediums.every((m) =>
        selectedCells.some(
          (c) => c.platform === platform && c.placement === m.code
        )
      )
    );
  };

  const isRowFullySelected = (placement: string) => {
    const validPlatforms = PLATFORMS.filter((p) =>
      isValidCombination(p.code, placement)
    );
    return (
      validPlatforms.length > 0 &&
      validPlatforms.every((p) =>
        selectedCells.some(
          (c) => c.platform === p.code && c.placement === placement
        )
      )
    );
  };

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
              {MEDIUMS.map((m) => {
                const rowFull = isRowFullySelected(m.code);
                return (
                  <th
                    key={m.code}
                    className="p-3 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-ink-50 dark:bg-ink-800 border-b border-ink-200 dark:border-ink-700"
                  >
                    <button
                      onClick={() => togglePlacementRow(m.code)}
                      className={`flex flex-col items-center gap-1 w-full px-2 py-1 rounded transition ${
                        rowFull
                          ? 'bg-teal-700 text-white'
                          : 'hover:bg-ink-100 dark:hover:bg-ink-700'
                      }`}
                      title={`Toggle all cells in "${m.name}" column`}
                    >
                      <span>{m.name}</span>
                      {m.availableFor && m.availableFor.length > 0 && (
                        <span className="text-[10px] uppercase tracking-wider text-copper-500">
                          YT only
                        </span>
                      )}
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map((p) => {
              const colFull = isColumnFullySelected(p.code);
              return (
                <tr key={p.code}>
                  <th className="p-3 text-xs font-semibold text-left text-ink-700 dark:text-ink-100 bg-ink-50/60 dark:bg-ink-800/60 border-r border-ink-200 dark:border-ink-700 whitespace-nowrap">
                    <button
                      onClick={() => togglePlatformColumn(p.code)}
                      className={`w-full text-left px-2 py-1 rounded transition ${
                        colFull
                          ? 'bg-teal-700 text-white'
                          : 'hover:bg-ink-100 dark:hover:bg-ink-700'
                      }`}
                      title={`Toggle all cells in "${p.name}" row`}
                    >
                      {p.name}
                    </button>
                  </th>
                  {MEDIUMS.map((m) => {
                    const valid = isValidCombination(p.code, m.code);
                    const cellSelected = isCellSelected(p.code, m.code);
                    const cellDisabled = !valid;

                    return (
                      <td
                        key={`${p.code}-${m.code}`}
                        className="p-2 border-t border-ink-200 dark:border-ink-700 text-center"
                      >
                        <button
                          onClick={() => {
                            if (cellDisabled) return;
                            toggleCell(p.code, m.code);
                          }}
                          disabled={cellDisabled}
                          aria-label={`${p.name} - ${m.name}`}
                          aria-pressed={cellSelected}
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
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={selectAllCells}
          className="text-xs px-3 py-1.5 rounded-md bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-100 border border-ink-200 dark:border-ink-700 transition"
        >
          {t('selectAll')} ({t('cells')})
        </button>
        <button
          onClick={clearAllCells}
          className="text-xs px-3 py-1.5 rounded-md bg-ink-100 dark:bg-ink-800 hover:bg-ink-200 dark:hover:bg-ink-700 text-ink-700 dark:text-ink-100 border border-ink-200 dark:border-ink-700 transition"
        >
          {t('clearAll')} ({t('cells')})
        </button>
      </div>
    </div>
  );
}
