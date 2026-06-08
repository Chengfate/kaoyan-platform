export function CardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
          <div className="h-3 bg-gray-200 rounded w-16 mb-3" />
          <div className="h-6 bg-gray-200 rounded w-12 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 8, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="h-5 bg-gray-200 rounded w-32 animate-pulse" />
      </div>
      <table className="w-full">
        <thead className="bg-gray-50 border-b-2 border-gray-200">
          <tr>
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-4 py-3"><div className="h-3 bg-gray-200 rounded w-16 mx-auto animate-pulse" /></th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r} className="border-t border-gray-100">
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c} className="px-4 py-3 text-center">
                  <div className="h-3 bg-gray-100 rounded w-full animate-pulse" style={{ animationDelay: `${r * 0.1}s` }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
          <div className="h-3 bg-gray-200 rounded w-16 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-24" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = '350px' }: { height?: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-64 mb-4" />
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <span className="text-gray-400 text-sm">加载图表中...</span>
      </div>
    </div>
  );
}

export function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="bg-white rounded-xl border border-gray-200 p-8">
        <div className="h-7 bg-gray-200 rounded w-48 mb-3" />
        <div className="h-4 bg-gray-200 rounded w-96 mb-4" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-4 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}
