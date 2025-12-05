/**
 * Loading skeleton for Hierarchies page
 */
export default function HierarchiesLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-4 w-96 bg-gray-200 rounded" />
        </div>
        <div className="h-10 w-48 bg-gray-200 rounded" />
      </div>

      {/* Info Banner Skeleton */}
      <div className="h-24 bg-white border border-gray-200 rounded-lg shadow-sm" />

      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2" />
            <div className="h-8 w-16 bg-gray-200 rounded" />
          </div>
        ))}
      </div>

      {/* Controls Skeleton */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-32 bg-gray-200 rounded" />
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="h-96 bg-white border border-gray-200 rounded-lg shadow-sm" />
        </div>

        {/* Graph Area */}
        <div className="col-span-12 lg:col-span-6">
          <div className="h-[700px] bg-white border border-gray-200 rounded-lg flex items-center justify-center shadow-sm">
            <div className="text-center">
              <svg
                className="animate-spin h-12 w-12 text-gray-400 mx-auto mb-4"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-600">Loading graph visualization...</p>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="col-span-12 lg:col-span-3 space-y-4">
          <div className="h-64 bg-white border border-gray-200 rounded-lg shadow-sm" />
          <div className="h-40 bg-white border border-gray-200 rounded-lg shadow-sm" />
        </div>
      </div>
    </div>
  );
}
