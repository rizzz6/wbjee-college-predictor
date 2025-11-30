"use client";

import { useState, useEffect, useMemo } from "react";
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

async function findRankForProgram(
  allData: RankEntry[],
  college: string,
  program: string,
  year: number,
  round: string,
  category: string,
  seatType: string
) {
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
      openingRank: parseInt(entry["Opening Rank"]),
      closingRank: parseInt(entry["Closing Rank"]),
    };
  }
  return null;
}

export default function RankFinderClient() {
  const [data, setData] = useState<RankEntry[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Open");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [selectedRound, setSelectedRound] = useState("Round 1");
  const [selectedSeatType, setSelectedSeatType] = useState("Open");

  const [result, setResult] = useState<{ openingRank: number; closingRank: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/data.json")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load data");
        return res.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        setLoadingData(false);
      })
      .catch((err) => {
        console.error("Error loading data:", err);
        setDataError("Failed to load college data. Please refresh.");
        setLoadingData(false);
      });
  }, []);

  const filters = useMemo(() => {
    if (data.length === 0) return { colleges: [], programs: [], categories: [], years: [], rounds: [], seatTypes: [] };

    const colleges = Array.from(new Set(data.map(d => d.Institute))).sort();
    const programs = Array.from(new Set(data.filter(d => d.Institute === selectedCollege).map(d => d.Program))).sort();
    const categories = Array.from(new Set(data.map(d => d.Category))).sort();
    const years = Array.from(new Set(data.map(d => d.Year))).sort((a, b) => b - a);
    const rounds = Array.from(new Set(data.map(d => d.Round))).sort();
    const seatTypes = Array.from(new Set(data.map(d => d["Seat Type"]))).sort();

    return { colleges, programs, categories, years, rounds, seatTypes };
  }, [data, selectedCollege]);

  const handleSearch = async () => {
    if (!selectedCollege || !selectedProgram) {
      setError("Please select both college and program");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await findRankForProgram(
        data,
        selectedCollege,
        selectedProgram,
        parseInt(selectedYear),
        selectedRound,
        selectedCategory,
        selectedSeatType
      );

      if (res) {
        setResult(res);
      } else {
        setError("No data found for the selected criteria.");
      }
    } catch {
      setError("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-red-600" />
      </div>
    );
  }

  if (dataError) {
    return (
      <div className="text-center py-20 text-red-500">
        <AlertCircle className="w-10 h-10 mx-auto mb-2" />
        {dataError}
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* College Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select College</label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
              value={selectedCollege}
              onChange={(e) => {
                setSelectedCollege(e.target.value);
                setSelectedProgram("");
              }}
            >
              <option value="">-- Choose College --</option>
              {filters.colleges.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Program Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Select Program</label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all disabled:opacity-50"
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              disabled={!selectedCollege}
            >
              <option value="">-- Choose Program --</option>
              {filters.programs.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          {/* Other Filters Row 1 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Year</label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              {filters.years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Round</label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
            >
              {filters.rounds.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          {/* Other Filters Row 2 */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {filters.categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Seat Type</label>
            <select
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
              value={selectedSeatType}
              onChange={(e) => setSelectedSeatType(e.target.value)}
            >
              {filters.seatTypes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="mt-8">
          <button
            onClick={handleSearch}
            disabled={loading || !selectedCollege || !selectedProgram}
            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" /> Finding Ranks...
              </>
            ) : (
              <>
                <Search className="w-6 h-6" /> Find Cutoff Ranks
              </>
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Results Section */}
        {result && (
          <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-6 border border-slate-200 dark:border-slate-600">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2 mb-6">
                Search Result
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-auto hidden md:inline">
                  {selectedYear} • {selectedRound}
                </span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opening Rank */}
                <div className="p-5 bg-white dark:bg-gray-800 border border-green-200 dark:border-green-900/50 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <ArrowUpFromLine className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Opening Rank</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white pl-1">
                    {result.openingRank.toLocaleString()}
                  </p>
                </div>

                {/* Closing Rank */}
                <div className="p-5 bg-white dark:bg-gray-800 border border-yellow-200 dark:border-yellow-900/50 rounded-xl shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                      <ArrowDownToLine className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Closing Rank</p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white pl-1">
                    {result.closingRank.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}