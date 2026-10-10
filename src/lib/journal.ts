import { get, writable } from 'svelte/store';

export type JournalEntry = { day: string; meal: 'lunch' | 'dinner'; placeId: string; note: string; rating: number };

const KEY = 'tuscany-guide-journal-v1';

function load(): JournalEntry[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(raw) ? raw.filter((e: JournalEntry) => e && typeof e.day === 'string' && typeof e.placeId === 'string') : [];
  } catch { return []; }
}

export const journal = writable<JournalEntry[]>([]);
export function journalReady(): void {
  if (typeof window === 'undefined') return;
  journal.set(load());
  journal.subscribe((value) => localStorage.setItem(KEY, JSON.stringify(value)));
}
export function entryFor(day: string, meal: 'lunch' | 'dinner'): JournalEntry | undefined {
  return get(journal).find((e) => e.day === day && e.meal === meal);
}
export function setEntry(entry: JournalEntry): void {
  journal.update((list) => [...list.filter((e) => !(e.day === entry.day && e.meal === entry.meal)), entry]);
}
export function removeEntry(day: string, meal: 'lunch' | 'dinner'): void {
  journal.update((list) => list.filter((e) => !(e.day === day && e.meal === meal)));
}
export function exportJournal(): string { return JSON.stringify(load(), null, 1); }
export function importJournal(json: string): boolean {
  try {
    const parsed = JSON.parse(json);
    if (!Array.isArray(parsed)) return false;
    localStorage.setItem(KEY, JSON.stringify(parsed));
    journal.set(parsed);
    return true;
  } catch { return false; }
}

function isoAdd(iso: string, days: number): string {
  const d = new Date(iso + 'T00:00:00'); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}
export function tripDays(start: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => isoAdd(start, i));
}
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dayOfWeek(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 7) % 7;
}
export function formatDay(iso: string): string {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return iso;
  return `${DAYS[dayOfWeek(iso)]} ${parts[2]} ${MONTHS[parts[1] - 1]}`;
}
