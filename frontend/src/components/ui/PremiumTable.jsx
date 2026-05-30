import React from 'react'
import { motion } from 'framer-motion'
import { ChevronUp, ChevronDown } from 'lucide-react'

export default function PremiumTable({
  columns = [], // { key, label, sortable: bool, sortField: str, render: fn, headerClassName: str, cellClassName: str, align: 'left'|'right'|'center' }
  data = [],
  sortKey,
  sortDirection, // 'asc' | 'desc'
  onSort,
  emptyState,
  onRowClick,
  rowKey = 'id'
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03
      }
    }
  }

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 220,
        damping: 18
      }
    }
  }

  return (
    <div className="overflow-x-auto w-full border border-dark-border rounded-2xl bg-dark-card/30 backdrop-blur-sm no-scrollbar">
      <table className="w-full text-sm border-collapse">
        <thead className="sticky top-0 bg-dark-surface z-10 border-b border-dark-border shadow-inner-glow">
          <tr>
            {columns.map((col) => {
              const alignClass =
                col.align === 'right'
                  ? 'text-right'
                  : col.align === 'center'
                  ? 'text-center'
                  : 'text-left'
              const isSorted = sortKey === col.key || (col.sortField && sortKey === col.sortField)

              return (
                <th
                  key={col.key}
                  onClick={() => col.sortable && onSort && onSort(col.sortField || col.key)}
                  className={`px-4 py-3.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider ${alignClass} ${
                    col.sortable ? 'cursor-pointer select-none hover:text-white transition-colors' : ''
                  } ${col.headerClassName || ''}`}
                >
                  <div
                    className={`flex items-center gap-1.5 ${
                      col.align === 'right'
                        ? 'justify-end'
                        : col.align === 'center'
                        ? 'justify-center'
                        : 'justify-start'
                    }`}
                  >
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="text-slate-500">
                        {isSorted ? (
                          sortDirection === 'desc' || sortDirection === 'down' ? (
                            <ChevronDown className="w-3.5 h-3.5 text-primary-400" />
                          ) : (
                            <ChevronUp className="w-3.5 h-3.5 text-primary-400" />
                          )
                        ) : (
                          <div className="flex flex-col -space-y-1 opacity-30">
                            <ChevronUp className="w-2.5 h-2.5" />
                            <ChevronDown className="w-2.5 h-2.5" />
                          </div>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              )
            })}
          </tr>
        </thead>
        <motion.tbody
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-dark-border/40"
        >
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-0">
                {emptyState}
              </td>
            </tr>
          ) : (
            data.map((item, idx) => (
              <motion.tr
                key={item[rowKey] || idx}
                variants={rowVariants}
                onClick={() => onRowClick && onRowClick(item)}
                className={`transition-colors duration-150 hover:bg-dark-elevated/40 ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
              >
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 text-slate-300 font-sans ${alignClass} ${col.cellClassName || ''}`}
                    >
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  )
                })}
              </motion.tr>
            ))
          )}
        </motion.tbody>
      </table>
    </div>
  )
}
