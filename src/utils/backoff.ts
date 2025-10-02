export async function expBackoff(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 10000
): Promise<void> {
  const delay = Math.min(baseDelayMs * Math.pow(2, attempt - 1), maxDelayMs);
  await new Promise(resolve => setTimeout(resolve, delay));
}
