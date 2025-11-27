"use client";

import { useState, useEffect, useMemo } from "react";
// FIX: Add Lucide imports for professional UI
import { Search, Loader2, AlertCircle, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

type RankEntry = {
  "Sr.No": string;
  Round: string;
  Institute: string;
  Program: string;
  Stream: string;
  Quota: string;
  Category: string;
  "Opening Rank": string;
  "Closing Rank": string;
  Year: number;
  "Seat Type": string;
};

// This function now finds the rank from the data loaded into the component's state.
async function findRankForProgram(
  allData: RankEntry[],
  college: string,
  program: string,
  year: number,
  round: string,
  category: string,
  seatType: string
) {
  // Simulate a small delay to provide user feedback
  await new Promise(resolve => setTimeout(resolve, 500));

  const entry = allData.find(
    (item) =>
      item.Institute === college &&
      item.Program === program &&
      item.Year === year &&
      item.Round === round &&
      item.Category === category &&
      item["Seat Type"] === seatType
  );

  if (entry) {
    return {
      openingRank: parseInt(entry["Opening Rank"], 10),
      closingRank: parseInt(entry["Closing Rank"], 10),
    };
  }
  return null;
}

type RankResult = {
  openingRank: number | null;
  closingRank: number | null;
};

export default function RankFinderClient() {
  const [allRankData, setAllRankData] = useState<RankEntry[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [rounds, setRounds] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [seatTypes, setSeatTypes] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string>("");
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(2022);
  const [selectedRound, setSelectedRound] = useState<string>("Round 1");
  const [selectedSeatType, setSelectedSeatType] = useState<string>("WBJEE Seats");
  const [selectedCategory, setSelectedCategory] = useState<string>("Open");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RankResult | null>(null);

  // Fetch and process data on component mount
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch('/data.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const jsonData: RankEntry[] = await response.json();
        setAllRankData(jsonData);

        // Populate filter options from the fetched data
        setYears([...new Set(jsonData.map(item => item.Year))].sort((a, b) => b - a));
        setRounds([...new Set(jsonData.map(item => item.Round))].sort());
        setCategories([...new Set(jsonData.map(item => item.Category))].sort());
        setSeatTypes([...new Set(jsonData.map(item => item["Seat Type"]))].sort());

      } catch (err) {
        console.error("Failed to fetch data.json", err);
        setError("Could not load college data. Please refresh the page.");
      }
    }
    loadData();
  }, []);

  const { colleges, programs } = useMemo(() => {
    if (allRankData.length === 0) {
      return { colleges: [], programs: [] };
    }

    const filteredData = allRankData.filter(item => item.Year === selectedYear && item["Seat Type"] === selectedSeatType);
    const uniqueColleges = [...new Set(filteredData.map(item => item.Institute))].sort();

    let uniquePrograms: string[] = [];
    if (selectedCollege) {
      uniquePrograms = [...new Set(
        filteredData
          .filter(item => item.Institute === selectedCollege)
          .map(item => item.Program)
      )].sort();
    }

    return {
      colleges: uniqueColleges,
      programs: uniquePrograms,
    };
  }, [allRankData, selectedYear, selectedCollege, selectedSeatType]);

  // Reset selections when filters change
  useEffect(() => {
    setSelectedCollege("");
    setSelectedProgram("");
    setResult(null);
  }, [selectedYear, selectedSeatType]);

  useEffect(() => {
    setSelectedProgram("");
    setResult(null);
  }, [selectedCollege]);

  const handleFindRank = async () => {
    if (!selectedCollege || !selectedProgram) {
      setError("Please select all filters, including a college and a program.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const rankData = await findRankForProgram(
        allRankData,
        selectedCollege,
        selectedProgram,
        selectedYear,
        selectedRound,
        selectedCategory,
        selectedSeatType
      );
      if (rankData) {
        setResult(rankData);
      } else {
        setError(`No rank data found for the selected criteria. Please try a different combination.`);
      }
    } catch {
      setError("Failed to process rank data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="bg-white dark:bg-gray-900 -mt-16">
      <div className="max-w-4xl mx-auto px-4 py-16 md:py-20">
        <div className="space-y-6">
          {/* Top Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label htmlFor="year-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Year</label>
              <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                {years.map(year => <option key={year} value={year}>{year}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="seat-type-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Seat Type</label>
              <select id="seat-type-select" value={selectedSeatType} onChange={(e) => setSelectedSeatType(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                {seatTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="round-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Round</label>
              <select id="round-select" value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                {rounds.map(round => <option key={round} value={round}>{round}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
              <select id="category-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          {/* Main Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label htmlFor="college-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select College
              </label>
              <select
                id="college-select"
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              >
                <option value="">-- Choose a college --</option>
                {colleges.map((college) => (
                  <option key={college} value={college}>{college}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="program-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Program
              </label>
              <select
                id="program-select"
                value={selectedProgram}
                onChange={(e) => setSelectedProgram(e.target.value)}
                disabled={!selectedCollege}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-200 dark:disabled:bg-gray-700 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              >
                <option value="">-- Choose a program --</option>
                {programs.map((program: string) => (
                  <option key={program} value={program}>{program}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Button */}
          <div>
            <button
              onClick={handleFindRank}
              disabled={!selectedCollege || !selectedProgram || isLoading}
              className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 dark:disabled:bg-blue-800 transition-colors"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Find Required Rank
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Results Card */}
        {result && !isLoading && (
          <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
              Rank for {selectedProgram} <span className="block text-sm font-normal text-gray-500 dark:text-gray-400 mt-1">at {selectedCollege}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-center">
              {/* Opening Rank */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowUpFromLine className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Opening Rank</p>
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">{result.openingRank ?? 'N/A'}</p>
              </div>

              {/* Closing Rank */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                 <div className="flex items-center justify-center gap-2 mb-2">
                  <ArrowDownToLine className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Closing Rank</p>
                </div>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-400">{result.closingRank ?? 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}