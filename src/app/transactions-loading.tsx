import { Skeleton } from "@/components/ui/skeleton";

export default function TransactionsLoading() {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      {/* Fake Sidebar */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 p-6 fixed left-0 top-0">
         <Skeleton className="h-8 w-8 bg-zinc-800 mb-8" />
         <Skeleton className="h-8 w-full bg-zinc-900 mb-4" />
         <Skeleton className="h-8 w-full bg-zinc-900 mb-4" />
      </div>

      <div className="flex-1 md:pl-64 transition-all">
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