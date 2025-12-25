interface SanityTableData {
  rows: {
    cells: string[];
  }[];
}

export default function SanityTable({ data }: { data: SanityTableData }) {
  if (!data || !data.rows || data.rows.length === 0) return null;

  const headerRow = data.rows[0];
  const bodyRows = data.rows.slice(1);

  return (
    <div className="overflow-x-auto my-8 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm">
      <table className="w-full text-sm text-left border-collapse">
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
  );
}