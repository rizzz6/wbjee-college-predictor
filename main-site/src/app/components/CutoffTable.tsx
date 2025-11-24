'use client'

import { useState, useEffect, useMemo } from 'react'

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

  // Default filters
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all')
  const [selectedRound, setSelectedRound] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  // Expansion state
  const [isExpanded, setIsExpanded] = useState(false)

  // Set defaults on mount
  useEffect(() => {
    if (uniqueYears.length > 0) {
      setSelectedYear(uniqueYears[0]) // Latest year
    }
    if (uniqueRounds.includes('Round 1')) {
      setSelectedRound('Round 1')
    }
    if (uniqueCategories.includes('Open')) {
      setSelectedCategory('Open')
    }
  }, [uniqueYears, uniqueRounds, uniqueCategories])

  // Filter and sort data
  const filteredData = useMemo(() => {
    return cutoffs
      .filter(cutoff => {
        const yearMatch = selectedYear === 'all' || cutoff.year === selectedYear
        const roundMatch = selectedRound === 'all' || cutoff.round === selectedRound
        const categoryMatch = selectedCategory === 'all' || cutoff.category === selectedCategory
        return yearMatch && roundMatch && categoryMatch
      })
      .sort((a, b) => a.openingRank - b.openingRank)
  }, [cutoffs, selectedYear, selectedRound, selectedCategory])

  // Visible rows based on expansion state
  const visibleRows = useMemo(() => {
    return isExpanded ? filteredData : filteredData.slice(0, INITIAL_ROW_COUNT)
  }, [filteredData, isExpanded])

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Years</option>
            {uniqueYears.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Round</label>
          <select
            value={selectedRound}
            onChange={(e) => setSelectedRound(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Rounds</option>
            {uniqueRounds.map(round => (
              <option key={round} value={round}>{round}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      {filteredData.length > 0 ? (
        <div className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden shadow-sm bg-white dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-900 uppercase bg-gray-100 dark:bg-gray-800 dark:text-white">
                <tr>
                  <th className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-700">Year</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-700">Round</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-700">Category</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-700">Program</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-700">Quota</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-700 text-right">Opening Rank</th>
                  <th className="px-6 py-4 font-bold border-b border-gray-200 dark:border-gray-700 text-right">Closing Rank</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((cutoff, index) => (
                  <tr
                    key={`${cutoff.year}-${cutoff.round}-${cutoff.category}-${cutoff.program}-${index}`}
                    className={`
                      bg-white dark:bg-gray-900
                      hover:bg-gray-50 dark:hover:bg-gray-800/50
                      transition-colors
                      ${index !== visibleRows.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                    `}
                  >
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{cutoff.year}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{cutoff.round}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                        {cutoff.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-bold">{cutoff.program}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{cutoff.quota}</td>
                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-mono text-right">{cutoff.openingRank}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white font-mono font-bold text-right">{cutoff.closingRank}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FADE & SHOW MORE BUTTON (Inside the Border) */}
          {!isExpanded && visibleRows.length < filteredData.length && (
            <div className="absolute bottom-0 left-0 right-0 pt-12 pb-4 flex justify-center bg-gradient-to-t from-white dark:from-gray-900 to-transparent">
              <button
                onClick={() => setIsExpanded(true)}
                className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Show All ({filteredData.length}) Rows
              </button>
            </div>
          )}

          {/* SHOW LESS BUTTON (Footer style when expanded) */}
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
      ) : (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No cutoffs found for the selected filters.
        </div>
      )}
    </div>
  )
}