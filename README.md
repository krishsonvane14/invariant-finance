# Invariant Finance

**A robust, secure personal finance dashboard built with Next.js, Supabase, and Plaid.**

[![Deploy with Vercel](https://vercel.com/button)](https://invariant-finance.vercel.app/)
<br />
**[View Live Demo](https://invariant-finance.vercel.app/)**

<!-- ## Demo Video

Check out the full walkthrough of Invariant, featuring real-time bank connection and budget tracking:

[![Watch the Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID_HERE/maxresdefault.jpg)](https://youtu.be/YOUR_VIDEO_LINK_HERE)

*(Click the image above to watch the video)*

--- -->

##  Features

-   **Real-Time Banking Connections**: Securely link bank accounts (Chase, Wells Fargo, etc.) using **Plaid API**.
-   **Smart Budgeting**: Create custom monthly budgets (e.g., Food, Travel) and track progress with dynamic progress bars.
-   **Live Net Worth Tracking**: Automatically calculates total assets across all connected checking, savings, and credit accounts.
-   **Interactive Analytics**:
    -   **Spending Breakdown**: Donut charts showing where money goes by category.
    -   **Income Analysis**: Dedicated view for tracking inflows and paychecks.
    -   **Market Terminal**: A simulated stock market analysis tool to track major indices and tech stocks.
-   **Bank-Grade Security**: Full implementation of Row Level Security (RLS) via Supabase to ensure data isolation.

##  Tech Stack

-   **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions)
-   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Authentication**: Supabase Auth
-   **ORM**: [Drizzle ORM](https://orm.drizzle.team/)
-   **Banking API**: [Plaid](https://plaid.com/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/)
-   **Charts**: [Recharts](https://recharts.org/)

##  Getting Started

### Prerequisites

1.  **Node.js** (v18 or higher)
2.  **Supabase Account** (for database & auth)
3.  **Plaid Dashboard Account** (for banking API keys)

### Installation

1.  **Clone the repository**
    ```bash
    git clone [https://github.com/yourusername/invariant.git](https://github.com/yourusername/invariant.git)
    cd invariant
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add your keys:

    ```env
    # Supabase (Database & Auth)
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    DATABASE_URL=your_postgres_connection_string

    # Plaid (Banking API)
    PLAID_CLIENT_ID=your_plaid_client_id
    PLAID_SECRET=your_plaid_secret_key
    PLAID_ENV=sandbox  # Use 'development' for real data
    ```

4.  **Push Database Schema**
    Sync your local schema with Supabase:
    ```bash
    npx drizzle-kit push
    ```

5.  **Run the App**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) to see the app.

## Security

This project uses **Row Level Security (RLS)** in PostgreSQL. This means:
-   Users can only read/write their own data.
-   Even if the API is accessed directly, a user cannot view another user's budgets or transactions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.