import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-black">
      {/* Fake Sidebar Skeleton */}
      <div className="hidden md:flex h-screen w-64 flex-col border-r border-zinc-800 bg-zinc-950 p-6 space-y-8 fixed left-0 top-0">
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 bg-zinc-800 rounded-lg animate-pulse" />
           <Skeleton className="h-6 w-24 bg-zinc-800" />
        </div>
        <div className="space-y-4">
           <Skeleton className="h-8 w-full bg-zinc-900" />
           <Skeleton className="h-8 w-full bg-zinc-900" />
           <Skeleton className="h-8 w-full bg-zinc-900" />
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 md:pl-64 transition-all">
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="flex justify-between items-center">
             <div className="space-y-2">
               <Skeleton className="h-8 w-48 bg-zinc-200 dark:bg-zinc-800" />
               <Skeleton className="h-4 w-64 bg-zinc-200 dark:bg-zinc-800" />
             </div>
             <Skeleton className="h-10 w-32 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-6 md:col-span-1">
              {/* Net Worth Card */}
              <Skeleton className="h-40 w-full rounded-xl bg-zinc-900" />
              {/* Budget Card */}
              <Skeleton className="h-60 w-full rounded-xl bg-zinc-200 dark:bg-zinc-900" />
            </div>

            <div className="md:col-span-2 space-y-6">
               {/* Chart Skeleton */}
               <Skeleton className="h-[300px] w-full rounded-xl bg-zinc-200 dark:bg-zinc-900" />
               
               {/* Transactions Skeleton */}
               <div className="space-y-4">
                 <Skeleton className="h-16 w-full rounded-lg bg-zinc-200 dark:bg-zinc-900" />
                 <Skeleton className="h-16 w-full rounded-lg bg-zinc-200 dark:bg-zinc-900" />
                 <Skeleton className="h-16 w-full rounded-lg bg-zinc-200 dark:bg-zinc-900" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}