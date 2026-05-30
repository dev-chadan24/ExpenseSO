import React from 'react'

export default function SkeletonLoader({ variant = 'rect', className = '', count = 1 }) {
  const getSkeletons = () => {
    switch (variant) {
      case 'stats':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass-card p-5 flex flex-col gap-3 relative overflow-hidden h-28 animate-pulse">
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-dark-border rounded w-20" />
                  <div className="w-8 h-8 bg-dark-border rounded-xl" />
                </div>
                <div className="h-6 bg-dark-border rounded w-32 mt-1" />
                <div className="h-3 bg-dark-border rounded w-24 mt-2" />
              </div>
            ))}
          </div>
        )
      case 'chart':
        return (
          <div className="glass-card p-6 flex flex-col gap-4 w-full h-[350px] animate-pulse">
            <div className="flex justify-between items-center mb-2">
              <div className="space-y-2">
                <div className="h-4 bg-dark-border rounded w-32" />
                <div className="h-3 bg-dark-border rounded w-24" />
              </div>
              <div className="w-24 h-8 bg-dark-border rounded-xl" />
            </div>
            <div className="flex-1 bg-dark-border/20 rounded-xl flex items-end justify-between p-4 gap-4">
              {[...Array(12)].map((_, i) => {
                const heights = ['h-[40%]', 'h-[65%]', 'h-[80%]', 'h-[45%]', 'h-[30%]', 'h-[75%]', 'h-[50%]', 'h-[90%]', 'h-[35%]', 'h-[60%]', 'h-[85%]', 'h-[70%]']
                return (
                  <div key={i} className={`flex-1 ${heights[i % heights.length]} bg-dark-border/40 rounded-t-md`} />
                )
              })}
            </div>
          </div>
        )
      case 'table':
        return (
          <div className="glass-card p-6 w-full animate-pulse space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-dark-border">
              <div className="h-4 bg-dark-border rounded w-48" />
              <div className="h-8 bg-dark-border rounded-xl w-32" />
            </div>
            <div className="space-y-3.5 pt-2">
              {[...Array(5)].map((_, idx) => (
                <div key={idx} className="flex items-center justify-between py-1">
                  <div className="h-3.5 bg-dark-border rounded w-[25%]" />
                  <div className="h-3.5 bg-dark-border rounded w-[15%]" />
                  <div className="h-3.5 bg-dark-border rounded w-[15%]" />
                  <div className="h-3.5 bg-dark-border rounded w-[20%]" />
                  <div className="h-3.5 bg-dark-border rounded w-[10%] text-right" />
                </div>
              ))}
            </div>
          </div>
        )
      case 'text':
        return (
          <div className="space-y-2">
            {[...Array(count)].map((_, i) => (
              <div key={i} className={`h-4 bg-dark-border rounded animate-pulse w-full ${className}`} />
            ))}
          </div>
        )
      case 'rect':
      default:
        return (
          <div className={`bg-dark-border/40 animate-pulse rounded-2xl ${className}`} style={{ minHeight: '20px' }} />
        )
    }
  }

  return getSkeletons()
}
