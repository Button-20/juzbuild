interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export default function TableSkeleton({
  rows = 5,
  columns = 4,
}: TableSkeletonProps) {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex space-x-4">
            <div className="rounded-md bg-gray-200 dark:bg-gray-600 h-12 w-12"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
