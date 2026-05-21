import React from 'react';

const Table = ({ columns, data, emptyMessage = 'No data available' }) => {
  return (
    <div className="table-container overflow-x-auto">
      <table className="min-w-full divide-y divide-surface-100">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className="px-6 py-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider bg-surface-50/50"
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-surface-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-surface-400 font-medium">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-surface-50/30 transition-colors duration-150">
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-6 py-4 whitespace-nowrap text-sm text-surface-700 font-medium"
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
