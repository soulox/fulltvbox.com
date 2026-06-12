/** Freshness helpers — drive NEW / UPDATED badges and "latest" sorting. */
const WINDOW_DAYS = 30;
const DAY = 86_400_000;

export function daysSince(date: string, now = new Date()): number {
  return Math.floor((now.getTime() - new Date(date).getTime()) / DAY);
}

export function isNew(publishDate: string, now = new Date()): boolean {
  const d = daysSince(publishDate, now);
  return d >= 0 && d <= WINDOW_DAYS;
}

export function isUpdated(updatedDate: string | undefined, publishDate: string, now = new Date()): boolean {
  if (!updatedDate) return false;
  const d = daysSince(updatedDate, now);
  return d >= 0 && d <= WINDOW_DAYS && new Date(updatedDate) > new Date(publishDate);
}

/** 'updated' takes precedence over 'new'; null when neither applies. */
export function freshness(publishDate: string, updatedDate?: string, now = new Date()): 'new' | 'updated' | null {
  if (isUpdated(updatedDate, publishDate, now)) return 'updated';
  if (isNew(publishDate, now)) return 'new';
  return null;
}

/** The later of publish/updated — used for "latest" sorting. */
export function latestDate(publishDate: string, updatedDate?: string): string {
  return updatedDate && new Date(updatedDate) > new Date(publishDate) ? updatedDate : publishDate;
}

/** Days until an ISO date (negative if past). */
export function daysUntil(date: string, now = new Date()): number {
  return Math.ceil((new Date(date).getTime() - now.getTime()) / DAY);
}
