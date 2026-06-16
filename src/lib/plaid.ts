import { Configuration, PlaidApi, PlaidEnvironments } from "plaid";

const VALID_ENVS = ["sandbox", "development", "production"] as const;
type PlaidEnv = (typeof VALID_ENVS)[number];

const envMap: Record<PlaidEnv, string> = {
  sandbox: PlaidEnvironments.sandbox,
  development: PlaidEnvironments.development,
  production: PlaidEnvironments.production,
};

function resolvePlaidEnv(): string {
  const raw = process.env.PLAID_ENV ?? "sandbox";
  if (VALID_ENVS.includes(raw as PlaidEnv)) {
    return envMap[raw as PlaidEnv];
  }
  console.warn(`[plaid] Unknown PLAID_ENV="${raw}", defaulting to sandbox`);
  return PlaidEnvironments.sandbox;
}

const configuration = new Configuration({
  basePath: resolvePlaidEnv(),
  baseOptions: {
    headers: {
      "PLAID-CLIENT-ID": process.env.PLAID_CLIENT_ID,
      "PLAID-SECRET": process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(configuration);