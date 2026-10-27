const STORAGE_KEY = "simplycode.messagesBadgeAckIds";

export function readAcknowledgedMessageIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id): id is string => typeof id === "string"));
  } catch {
    return new Set();
  }
}

export function acknowledgeMessageIds(ids: string[]): Set<string> {
  const next = readAcknowledgedMessageIds();
  for (const id of ids) next.add(id);
  if (typeof window !== "undefined") {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
  }
  return next;
}
