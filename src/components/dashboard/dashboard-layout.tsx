import { Sidebar } from "./sidebar";

interface DashboardLayoutProps {
  user: any;
  banks: any[];
  children: React.ReactNode;
}

export function DashboardLayout({ user, banks, children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300">
      <Sidebar user={user} banks={banks} />
      <div className="flex-1 min-w-0 flex flex-col">
        {children}
      </div>
    </div>
  );
}
