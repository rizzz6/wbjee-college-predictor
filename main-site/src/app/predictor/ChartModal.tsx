import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import { X } from 'lucide-react'; // Import X icon

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

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

interface ChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  college: CollegeData | null;
  allData: CollegeData[];
}

export default function ChartModal({ isOpen, onClose, college, allData }: ChartModalProps) {
  if (!isOpen || !college) return null;

  const trendData = allData.filter(item =>
    item.institute === college.institute &&
    item.branch === college.branch &&
    item.category === college.category &&
    item.quota === college.quota &&
    item.seat_type === college.seat_type
  ).sort((a, b) => (a.year || 0) - (b.year || 0));

  const validData = trendData.filter(d => d.closing_rank !== null);

  if (validData.length < 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Rank Trend: {college.branch} at {college.institute}
            </h3>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            >
              {/* FIX: Replaced text "×" with Lucide Icon */}
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6">
            <div className="text-center py-8 text-slate-500">
              Not enough historical data to show a trend.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const data = {
    labels: validData.map(d => d.year?.toString() || ''),
    datasets: [{
      label: 'Closing Rank',
      data: validData.map(d => d.closing_rank),
      borderColor: 'rgba(59, 130, 246, 0.8)',
      backgroundColor: 'rgba(59, 130, 246, 0.2)',
      fill: true,
      tension: 0.1
    }]
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        title: { display: true, text: 'Rank', color: '#374151' },
        ticks: { color: '#374151' }
      },
      x: {
        title: { display: true, text: 'Year', color: '#374151' },
        ticks: { color: '#374151' }
      }
    },
    plugins: {
      legend: { labels: { color: '#374151' } }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Rank Trend: {college.branch} at {college.institute}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          >
            {/* FIX: Replaced text "×" with Lucide Icon */}
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}