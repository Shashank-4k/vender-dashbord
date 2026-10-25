import React from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown } from 'lucide-react';

const DataTable = ({
  columns,
  data,
  totalCount,
  page,
  pageSize,
  onPageChange,
  onSort,
  sortBy,
  sortDir: _sortDir,
  loading = false,
  emptyMessage = 'No records found matching the criteria.',
}) => {
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="bg-white dark:bg-[#172033] rounded-xl border border-slate-200 dark:border-[#293548] overflow-hidden shadow-xs transition-colors duration-200">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-[#293548] text-left text-sm">
          <thead className="bg-slate-50 dark:bg-[#111827] text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 ${col.sortable ? 'cursor-pointer hover:bg-slate-100/70 dark:hover:bg-[#1E293B] select-none' : ''} ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                  onClick={() => col.sortable && onSort && onSort(col.key)}
                >
                  <div className={`inline-flex items-center space-x-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      <ArrowUpDown className={`w-3 h-3 ${sortBy === col.key ? 'text-indigo-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-400'}`} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#293548]/70 text-slate-700 dark:text-slate-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 dark:text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 dark:border-blue-400 border-t-transparent mb-2"></div>
                  <p className="text-xs">Loading database records...</p>
                </td>
              </tr>
            ) : data && data.length > 0 ? (
              data.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/80 dark:hover:bg-[#1E293B]/70 transition">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 whitespace-nowrap ${col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}`}
                    >
                      {col.render ? col.render(row[col.key], row) : (row[col.key] !== null && row[col.key] !== undefined ? row[col.key] : '—')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 dark:text-slate-400 text-sm">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalCount > pageSize && (
        <div className="px-4 py-3 bg-slate-50 dark:bg-[#111827] border-t border-slate-200 dark:border-[#293548] flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min((page - 1) * pageSize + 1, totalCount)}</span> to{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min(page * pageSize, totalCount)}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalCount}</span> entries
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1 rounded-md border border-slate-300 dark:border-[#293548] bg-white dark:bg-[#172033] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-medium text-slate-700 dark:text-slate-300">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1 rounded-md border border-slate-300 dark:border-[#293548] bg-white dark:bg-[#172033] text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#1E293B] disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;

