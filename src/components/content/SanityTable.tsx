interface SanityTableData {
  rows: {
    cells: string[];
  }[];
}

interface SanityTableProps {
  data: SanityTableData;
  caption?: string;
}

export default function SanityTable({ data, caption }: SanityTableProps) {
  if (!data || !data.rows || data.rows.length === 0) {
    return (
      <div className="my-8 p-8 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 font-medium">No data available</p>
      </div>
    );
  }

  const headerRow = data.rows[0];
  const bodyRows = data.rows.slice(1);

  if (bodyRows.length === 0) {
    return (
      <div className="my-8 p-8 text-center border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
        <svg
          className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600 mb-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Table has headers but no data rows</p>
      </div>
    );
  }

  return (
    <div className="my-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      {/* Mobile scroll hint */}
      <div className="sm:hidden px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          Scroll horizontally to see all columns
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left border-collapse">
          {caption && (
            <caption className="sr-only">{caption}</caption>
          )}
          <thead className="text-xs text-gray-900 uppercase bg-gray-100 dark:bg-gray-800 dark:text-white">
            <tr>
              {headerRow.cells.map((cell: string, index: number) => (
                <th
                  key={index}
                  scope="col"
                  className={`
                    px-6 py-4 font-bold
                    border-b border-gray-200 dark:border-gray-700
                    ${index !== headerRow.cells.length - 1 ? 'border-r border-gray-200 dark:border-r-gray-700' : ''}
                  `}
                >
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rowIndex: number) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                {row.cells.map((cell: string, cellIndex: number) => (
                  <td
                    key={cellIndex}
                    className={`
                      px-6 py-4 text-gray-700 dark:text-gray-300 font-medium
                      ${cellIndex !== row.cells.length - 1 ? 'border-r border-gray-200 dark:border-r-gray-700' : ''}
                      ${rowIndex !== bodyRows.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}
                    `}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
