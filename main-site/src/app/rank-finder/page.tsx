import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "WBJEE Rank Finder - Find Required Rank for Colleges",
  description: "Find the required WBJEE rank for admission to specific colleges and programs. Browse historical cutoff data, opening and closing ranks for engineering colleges in West Bengal. Get precise rank requirements for Jadavpur University, Calcutta University, and other institutions.",
  keywords: [
    "WBJEE rank finder",
    "WBJEE cutoff rank",
    "college rank requirement",
    "WBJEE opening rank",
    "WBJEE closing rank",
    "engineering college cutoff",
    "WBJEE rank predictor",
    "college admission rank",
    "WBJEE 2025 cutoff",
    "engineering college finder"
  ],
  alternates: {
    canonical: '/rank-finder',
  },
  openGraph: {
    title: "WBJEE Rank Finder - Find Required Rank for Colleges",
    description: "Find the required WBJEE rank for admission to specific colleges and programs. Browse historical cutoff data and rank requirements.",
    url: "https://www.rwbjee.com/rank-finder",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "WBJEE Rank Finder - Find required rank for colleges",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WBJEE Rank Finder - Find Required Rank for Colleges",
    description: "Find the required WBJEE rank for admission to specific colleges and programs.",
    images: ["/og-image.svg"],
  },
};

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import SearchableDropdown from "../components/SearchableDropdown";

interface CollegeData {
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
}

function Hero() {
  return (
    <section className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-red-50 via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900" />
      <div className="max-w-7xl mx-auto px-4 py-20 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 dark:text-white">
            Find the Rank You Need
          </h1>
          <p className="mt-4 text-lg md:text-xl text-gray-500 dark:text-gray-300">
            Select a college and program to see the required rank to get in.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

function RankFinder() {
  const [data, setData] = useState<CollegeData[]>([]);
  const [colleges, setColleges] = useState<string[]>([]);
  const [programs, setPrograms] = useState<string[]>([]);
  const [rounds, setRounds] = useState<string[]>([]);
  const [quotas, setQuotas] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [seatTypes, setSeatTypes] = useState<string[]>([]);

  const [selectedCollege, setSelectedCollege] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [selectedRound, setSelectedRound] = useState("");
  const [selectedQuota, setSelectedQuota] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSeatType, setSelectedSeatType] = useState("");

  const [results, setResults] = useState<CollegeData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleResetFilters = () => {
    setSelectedCollege("");
    setSelectedProgram("");
    setSelectedRound("");
    setSelectedQuota("");
    setSelectedCategory("");
    setSelectedSeatType("");
    setResults([]);
  };

  useEffect(() => {
    fetch("/predictor/data.json")
      .then((response) => response.json())
      .then((data) => {
        setData(data);
        const uniqueColleges = [...new Set(data.map((item: CollegeData) => item.Institute))];
        const uniquePrograms = [...new Set(data.map((item: CollegeData) => item.Program))];
        const uniqueRounds = [...new Set(data.map((item: CollegeData) => item.Round))];
        const uniqueQuotas = [...new Set(data.map((item: CollegeData) => item.Quota))];
        const uniqueCategories = [...new Set(data.map((item: CollegeData) => item.Category))];
        const uniqueSeatTypes = [...new Set(data.map((item: CollegeData) => item["Seat Type"]))];

        setColleges(uniqueColleges as string[]);
        setPrograms(uniquePrograms as string[]);
        setRounds(uniqueRounds as string[]);
        setQuotas(uniqueQuotas as string[]);
        setCategories(uniqueCategories as string[]);
        setSeatTypes(uniqueSeatTypes as string[]);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load college data.");
      });
  }, []);

  useEffect(() => {
    let filteredData = data;

    if (selectedCollege) {
      filteredData = filteredData.filter((item) => item.Institute === selectedCollege);
    }
    if (selectedProgram) {
      filteredData = filteredData.filter((item) => item.Program === selectedProgram);
    }
    if (selectedRound) {
      filteredData = filteredData.filter((item) => item.Round === selectedRound);
    }
    if (selectedQuota) {
      filteredData = filteredData.filter((item) => item.Quota === selectedQuota);
    }
    if (selectedCategory) {
      filteredData = filteredData.filter((item) => item.Category === selectedCategory);
    }
    if (selectedSeatType) {
      filteredData = filteredData.filter((item) => item["Seat Type"] === selectedSeatType);
    }

    if (data.length > 0) {
        const uniqueColleges = [...new Set(filteredData.map((item) => item.Institute))];
        setColleges(uniqueColleges);
        const uniquePrograms = [...new Set(filteredData.map((item) => item.Program))];
        setPrograms(uniquePrograms);
        const uniqueRounds = [...new Set(filteredData.map((item) => item.Round))];
        setRounds(uniqueRounds);
        const uniqueQuotas = [...new Set(filteredData.map((item) => item.Quota))];
        setQuotas(uniqueQuotas);
        const uniqueCategories = [...new Set(filteredData.map((item) => item.Category))];
        setCategories(uniqueCategories);
        const uniqueSeatTypes = [...new Set(filteredData.map((item) => item["Seat Type"]))];
        setSeatTypes(uniqueSeatTypes);
    }

  }, [selectedCollege, selectedProgram, selectedRound, selectedQuota, selectedCategory, selectedSeatType, data]);

  useEffect(() => {
    if (selectedCollege && selectedProgram) {
      const filteredData = data.filter(
        (item) =>
          item.Institute === selectedCollege &&
          item.Program === selectedProgram &&
          (selectedRound ? item.Round === selectedRound : true) &&
          (selectedQuota ? item.Quota === selectedQuota : true) &&
          (selectedCategory ? item.Category === selectedCategory : true) &&
          (selectedSeatType ? item["Seat Type"] === selectedSeatType : true)
      );
      setResults(filteredData);
    } else {
      setResults([]);
    }
  }, [selectedCollege, selectedProgram, selectedRound, selectedQuota, selectedCategory, selectedSeatType, data]);

  return (
    <section className="bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SearchableDropdown
            label="College"
            options={colleges}
            selectedOption={selectedCollege}
            onSelect={setSelectedCollege}
          />
          <SearchableDropdown
            label="Program"
            options={programs}
            selectedOption={selectedProgram}
            onSelect={setSelectedProgram}
          />
          <div>
            <label htmlFor="round" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Round
            </label>
            <select
              id="round"
              name="round"
              value={selectedRound}
              onChange={(e) => setSelectedRound(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">Select a round</option>
              {rounds.map((round) => (
                <option key={round} value={round}>
                  {round}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="quota" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Quota
            </label>
            <select
              id="quota"
              name="quota"
              value={selectedQuota}
              onChange={(e) => setSelectedQuota(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">Select a quota</option>
              {quotas.map((quota) => (
                <option key={quota} value={quota}>
                  {quota}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="seatType" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Seat Type
            </label>
            <select
              id="seatType"
              name="seatType"
              value={selectedSeatType}
              onChange={(e) => setSelectedSeatType(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">Select a seat type</option>
              {seatTypes.map((seatType) => (
                <option key={seatType} value={seatType}>
                  {seatType}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleResetFilters}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Reset Filters
          </button>
        </div>
        
        {error && (
          <div className="mt-8 text-center text-red-500">
            {error}
          </div>
        )}
        {results.length > 0 && (
          <div className="mt-8 overflow-x-a">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Year
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Round
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Opening Rank
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300">
                    Closing Rank
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {results.map((result) => (
                  <tr key={result['Sr.No']}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {result.Year}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {result.Round}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {result["Opening Rank"]}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                      {result["Closing Rank"]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default function Page() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
      <Hero />
      <RankFinder />
    </div>
  );
}
