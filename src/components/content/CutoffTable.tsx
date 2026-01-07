'use client'

import { useCutoffFilters } from '@/hooks/useCutoffFilters'

interface Cutoff {
  year: number
  round: string
  openingRank: number
  closingRank: number
  category: string
  quota: string
  seatType?: string
  program: string
}

interface CutoffTableProps {
  cutoffs: Cutoff[]
}

const INITIAL_ROW_COUNT = 10

export default function CutoffTable({ cutoffs }: CutoffTableProps) {
  const {
    filters,
    updateFilter,
    uniqueYears,
    uniqueRounds,
    uniqueCategories,
    uniquePrograms,
    uniqueQuotas,
    uniqueSeatTypes,
    showQuota,
    showSeatType,
    visibleRows,
    isExpanded,
    setIsExpanded,
    totalResults
  } = useCutoffFilters({ cutoffs, initialRowCount: INITIAL_ROW_COUNT })

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Year</label>
          <select
            value={filters.year}
            onChange={(e) => updateFilter('year', e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            <option value="all">All Years</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Round</label>
          <select
            value={filters.round}
            onChange={(e) => updateFilter('round', e.target.value)}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            {uniqueRounds.map(r => <option key={r} value={r}>{r}</option>)}
            <option value="all">All Rounds</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
          <select
            value={filters.category}
            onChange={(e) => updateFilter('category', e.target.value)}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Branch</label>
          <select
            value={filters.program}
            onChange={(e) => updateFilter('program', e.target.value)}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option value="all">All Branches</option>
            {uniquePrograms.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>

        {showQuota && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Quota</label>
            <select
              value={filters.quota}
              onChange={(e) => updateFilter('quota', e.target.value)}
              className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="all">All Quotas</option>
              {uniqueQuotas.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
        )}

        {showSeatType && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-500 uppercase">Seat Type</label>
            <select
              value={filters.seatType}
              onChange={(e) => updateFilter('seatType', e.target.value)}
              className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
            >
              <option value="all">All Seat Types</option>
              {uniqueSeatTypes.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 glass-header sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Year</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Round</th>
                {showQuota && <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Quota</th>}
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
                {showSeatType && <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Seat Type</th>}
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Branch</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Opening</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400 text-right">Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {visibleRows.length > 0 ? (
                visibleRows.map((item, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">{item.year}</td>
                    <td className="px-4 py-3">{item.round}</td>
                    {showQuota && <td className="px-4 py-3">{item.quota}</td>}
                    <td className="px-4 py-3">{item.category}</td>
                    {showSeatType && <td className="px-4 py-3">{item.seatType || '-'}</td>}
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.program}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-300">{item.openingRank}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-gray-900 dark:text-white">{item.closingRank}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6 + (showQuota ? 1 : 0) + (showSeatType ? 1 : 0)} className="px-4 py-8 text-center text-gray-500">
                    No data found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* FADE & SHOW MORE BUTTON */}
          {!isExpanded && visibleRows.length < totalResults && (
            <div className="absolute bottom-0 left-0 right-0 pt-12 pb-4 flex justify-center bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-20">
              <button
                onClick={() => setIsExpanded(true)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Show All ({totalResults}) Rows
              </button>
            </div>
          )}

          {/* SHOW LESS BUTTON */}
          {isExpanded && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800/50 flex justify-center">
              <button
                onClick={() => setIsExpanded(false)}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium uppercase tracking-wide"
              >
                Show Less
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}