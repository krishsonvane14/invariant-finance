export function cleanTransactionName(rawName: string): { name: string; logo: string } {
  const lower = rawName.toLowerCase();

  // 1. Define Rules for popular merchants
  if (lower.includes("uber")) return { name: "Uber", logo: "🚗" };
  if (lower.includes("united airlines")) return { name: "United Airlines", logo: "✈️" };
  if (lower.includes("mcdonald")) return { name: "McDonald's", logo: "🍔" };
  if (lower.includes("starbucks")) return { name: "Starbucks", logo: "☕" };
  if (lower.includes("sparkfun")) return { name: "SparkFun", logo: "⚡" };
  if (lower.includes("netflix")) return { name: "Netflix", logo: "📺" };
  if (lower.includes("spotify")) return { name: "Spotify", logo: "🎵" };
  if (lower.includes("lyft")) return { name: "Lyft", logo: "🚕" };
  if (lower.includes("doordash")) return { name: "DoorDash", logo: "🥡" };
  if (lower.includes("amazon")) return { name: "Amazon", logo: "📦" };

  // 2. Default: Just make the text look nicer (Capitalize First Letter)
  // e.g. "ACH TRANSFER" -> "Ach Transfer"
  const formatted = rawName
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return { name: formatted, logo: "💸" };
}