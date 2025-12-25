interface ResultCardProps {
    openingRank: number;
    closingRank: number;
}

export function ResultCard({ openingRank, closingRank }: ResultCardProps) {
    return (
        <div className="mt-6 p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 
                    rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Cutoff Ranks
            </h3>
            <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Opening Rank</p>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {openingRank.toLocaleString()}
                    </p>
                </div>
                <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Closing Rank</p>
                    <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                        {closingRank.toLocaleString()}
                    </p>
                </div>
            </div>
            <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                <p>You need a rank between <strong>{openingRank}</strong> and <strong>{closingRank}</strong> to get admission</p>
            </div>
        </div>
    );
}
