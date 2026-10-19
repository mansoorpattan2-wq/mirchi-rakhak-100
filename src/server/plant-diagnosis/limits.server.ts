import { DiagnosisError } from "../../lib/diagnosis-contract";

// Per-process protection. A shared gateway quota is required for multiple server instances.
export function createDiagnosisLimiter(now: () => number = Date.now) {
  const users = new Map<string, { minute: number; count: number; day: number; daily: number }>();
  const active = new Set<string>();
  let globalDay = -1;
  let globalCount = 0;
  return (user: string) => {
    const minute = Math.floor(now() / 60_000);
    const day = Math.floor(now() / 86_400_000);
    for (const [key, value] of users) if (value.day < day) users.delete(key);
    if (globalDay !== day) {
      globalDay = day;
      globalCount = 0;
    }
    const current = users.get(user) ?? { minute, count: 0, day, daily: 0 };
    if (current.minute !== minute) {
      current.minute = minute;
      current.count = 0;
    }
    if (
      current.count >= 5 ||
      current.daily >= 50 ||
      globalCount >= 500 ||
      (!users.has(user) && users.size >= 2000)
    )
      throw new DiagnosisError(
        "RATE_LIMIT",
        429,
        "The scan limit has been reached. Please try again later.",
        current.daily >= 50 || globalCount >= 500 ? 86400 : 60,
      );
    if (active.has(user))
      throw new DiagnosisError(
        "SCAN_IN_PROGRESS",
        409,
        "Your photo is already being analyzed. Please wait.",
      );
    if (active.size >= 3)
      throw new DiagnosisError(
        "SERVICE_BUSY",
        429,
        "The image service is busy. Please retry shortly.",
        20,
      );
    current.count++;
    current.daily++;
    globalCount++;
    users.set(user, current);
    active.add(user);
    return () => {
      active.delete(user);
    };
  };
}
export const acquireDiagnosisSlot = createDiagnosisLimiter();
