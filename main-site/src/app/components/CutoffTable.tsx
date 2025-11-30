'use client'

import { useState, useMemo } from 'react'

interface Cutoff {
  year: number
  round: string
  openingRank: number
  closingRank: number
  category: string
  quota: string
  program: string
}

interface CutoffTableProps {
  cutoffs: Cutoff[]
}

const INITIAL_ROW_COUNT = 10

export default function CutoffTable({ cutoffs }: CutoffTableProps) {
  // Extract unique values
  const uniqueYears = useMemo(() => [...new Set(cutoffs.map(c => c.year))].sort((a, b) => b - a), [cutoffs])
  const uniqueRounds = useMemo(() => [...new Set(cutoffs.map(c => c.round))].sort(), [cutoffs])
  const uniqueCategories = useMemo(() => [...new Set(cutoffs.map(c => c.category))].sort(), [cutoffs])

  // FIX: Initialized state directly to avoid useEffect set-state error
  const [selectedYear, setSelectedYear] = useState<number | 'all'>(() =>
    uniqueYears.length > 0 ? uniqueYears[0] : 'all'
  )

  const [selectedRound, setSelectedRound] = useState<string>(() =>
    uniqueRounds.includes('Round 1') ? 'Round 1' : 'all'
  )

  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Expansion state
  const [isExpanded, setIsExpanded] = useState(false)

  // Filter logic
  const filteredData = useMemo(() => {
    return cutoffs.filter(c => {
      const matchYear = selectedYear === 'all' || c.year === selectedYear
      const matchRound = selectedRound === 'all' || c.round === selectedRound
      const matchCategory = selectedCategory === 'all' || c.category === selectedCategory
      return matchYear && matchRound && matchCategory
    }).sort((a, b) => a.openingRank - b.openingRank)
  }, [cutoffs, selectedYear, selectedRound, selectedCategory])

  const visibleRows = isExpanded ? filteredData : filteredData.slice(0, INITIAL_ROW_COUNT)

  return (
    <div className="w-full space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
            <option value="all">All Years</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Round</label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            {uniqueRounds.map(r => <option key={r} value={r}>{r}</option>)}
            <option value="all">All Rounds</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-500 uppercase">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="relative border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-gray-800 glass-header sticky top-0 z-10">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Year</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Round</th>
                <th className="px-4 py-3 font-medium text-gray-500 dark:text-gray-400">Category</th>
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
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{item.program}</td>
                    <td className="px-4 py-3 text-right font-mono text-gray-600 dark:text-gray-300">{item.openingRank}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-gray-900 dark:text-white">{item.closingRank}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    No data found for selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* FADE & SHOW MORE BUTTON */}
          {!isExpanded && visibleRows.length < filteredData.length && (
            <div className="absolute bottom-0 left-0 right-0 pt-12 pb-4 flex justify-center bg-gradient-to-t from-white dark:from-gray-900 to-transparent z-20">
              <button
                onClick={() => setIsExpanded(true)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Show All ({filteredData.length}) Rows
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