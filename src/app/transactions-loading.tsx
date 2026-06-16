import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      {/* Sidebar skeleton — matches collapsed w-14 state */}
      <div className="w-14 shrink-0 sticky top-0 h-screen flex flex-col items-center border-r border-zinc-800 bg-zinc-950 py-4 px-3 gap-5">
        <div className="h-8 w-8 bg-zinc-800 rounded-lg animate-pulse" />
        <div className="h-5 w-5 bg-zinc-900 rounded animate-pulse" />
        <div className="h-5 w-5 bg-zinc-900 rounded animate-pulse" />
        <div className="h-5 w-5 bg-zinc-900 rounded animate-pulse" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800" />
                <Skeleton className="h-4 w-96 bg-zinc-200 dark:bg-zinc-800" />
            </div>

            {/* Table Skeleton */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-900 p-4 space-y-4">
                <div className="flex justify-between pb-4 border-b border-zinc-100 dark:border-zinc-800">
                    <Skeleton className="h-8 w-64" />
                </div>
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex justify-between items-center py-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}