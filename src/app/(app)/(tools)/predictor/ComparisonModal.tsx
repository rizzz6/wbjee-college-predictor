import { X } from 'lucide-react'; // Import X icon

interface CollegeData {
  id: string;
  round: string;
  institute: string;
  branch: string;
  seat_type: string;
  quota: string;
  category: string;
  opening_rank: number | null;
  closing_rank: number | null;
  year: number | null;
  prediction: {
    text: string;
    order: number;
  };
}

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  favorites: Set<string>;
  allData: CollegeData[];
}

export default function ComparisonModal({ isOpen, onClose, favorites, allData }: ComparisonModalProps) {
  if (!isOpen) return null;

  const favoriteColleges = allData.filter(item => favorites.has(item.id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">College Comparison</h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {/* FIX: Replaced text "×" with Lucide Icon */}
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {favoriteColleges.map((college) => (
              <div key={college.id} className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                <h4 className="font-bold text-lg text-slate-900 dark:text-slate-100 mb-2">
                  {college.institute}
                </h4>
                <p className="text-blue-600 dark:text-blue-400 mb-3">{college.branch}</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Category:</strong> {college.category}</p>
                  <p><strong>Closing Rank:</strong> {college.closing_rank || 'N/A'}</p>
                  <p><strong>Prediction:</strong>
                    <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${college.prediction.text === 'Confirm' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100' :
                        college.prediction.text === 'Great' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100' :
                          college.prediction.text === 'Good' ? 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-100' :
                            college.prediction.text === 'Borderline' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100' :
                              'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-100'
                      }`}>
                      {college.prediction.text}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}