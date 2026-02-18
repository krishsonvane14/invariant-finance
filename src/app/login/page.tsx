import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { login } from "./actions";
import { ArrowRight, CheckCircle2, ShieldCheck, LineChart, Wallet } from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle"; 

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col transition-colors duration-300">
      
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto w-full">
        <div className="text-2xl font-bold tracking-tighter flex items-center gap-2">
          <div className="h-8 w-8 bg-zinc-900 dark:bg-white rounded-lg flex items-center justify-center">
            <span className="text-white dark:text-zinc-900 font-bold">I</span>
          </div>
          <span className="text-zinc-900 dark:text-white">Invariant</span>
        </div>
        
        <div className="flex items-center gap-4">
           <ModeToggle />
           
           <form action={login}>
            <Button variant="ghost" className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
              Log in
            </Button>
          </form>
           <form action={login}>
            <Button className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200">
              Get Started
            </Button>
          </form>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20">
        <div className="max-w-4xl space-y-8">
          <div className="inline-flex items-center rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1 text-sm font-medium text-zinc-900 dark:text-zinc-50 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
            v1.0 Now Live
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Stop wondering where <br/> your <span className="text-blue-600 dark:text-blue-500">money went.</span>
          </h1>
          
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Connect your accounts, track your net worth, and visualize your spending habits in seconds. 
            Secure, private, and cleaner than your bank's app.
          </p>
          
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <form action={login}>
              <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-105">
                Sign in with Google <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>
            
          </div>

          <div className="flex items-center justify-center gap-8 pt-8 text-sm text-zinc-500 dark:text-zinc-500">
            <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> AES-256 Encryption</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-blue-500" /> SOC2 Compliant</span>
            <span className="flex items-center gap-2"><Wallet className="h-4 w-4 text-purple-500" /> No Credit Card Required</span>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
        <div className="grid md:grid-cols-3 gap-8 p-12 max-w-7xl mx-auto w-full">
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4 text-blue-600 dark:text-blue-400">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Bank Sync</CardTitle>
              <CardDescription className="text-base mt-2">
                Real-time connection to 11,000+ global financial institutions via Plaid.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4 text-green-600 dark:text-green-400">
                <LineChart className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Smart Analytics</CardTitle>
              <CardDescription className="text-base mt-2">
                Automatic categorization and visual breakdowns of your spending habits.
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <div className="h-12 w-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mb-4 text-purple-600 dark:text-purple-400">
                <Wallet className="h-6 w-6" />
              </div>
              <CardTitle className="text-xl">Net Worth</CardTitle>
              <CardDescription className="text-base mt-2">
                Watch your wealth grow with automated asset and liability tracking.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}