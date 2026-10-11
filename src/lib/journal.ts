import { writable, get } from 'svelte/store';
import bookingsEnc from '../../data/bookings.enc.json';

export type JournalEntry = { day: string; meal: 'lunch' | 'dinner'; placeId: string; note: string; rating: number };
export type Booking = { day: string; sort: string; time: string; title: string; url?: string; activityUrl?: string; address?: string; travel?: string; note?: string };

const KEY = 'tuscany-guide-journal-v1';
const SESSION = 'tuscany-guide-bookings-passphrase';

/** The shipped ciphertext (safe to publish); unlocked at runtime via passphrase. */
export const bookingsCipher = bookingsEnc as { salt: string; iv: string; data: string; kdf: string };
export const bookingsStore = writable<Booking[] | null>(null);

// --- encrypted bookings (AES-256-GCM, PBKDF2-SHA256; see scripts/encrypt-bookings.mjs) ---

/** Decrypt the shipped ciphertext with the user's passphrase. Throws on wrong key or tampering. */
export async function decryptBookings(enc: { salt: string; iv: string; data: string; kdf: string }, passphrase: string): Promise<Booking[]> {
  const iter = Number((enc.kdf || '').split(':')[1] || 210000);
  const base = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: base(enc.salt), iterations: iter, hash: 'SHA-256' },
    material, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: base(enc.iv), tagLength: 128 }, key, base(enc.data));
  return JSON.parse(new TextDecoder().decode(plain));
}

export function rememberPassphrase(pass: string) { try { sessionStorage.setItem(SESSION, pass); } catch { /* private mode */ } }
export function forgetPassphrase() { try { sessionStorage.removeItem(SESSION); } catch { /* ignore */ } }
export function rememberedPassphrase(): string { try { return sessionStorage.getItem(SESSION) || ''; } catch { return ''; } }

// --- user journal (device-local, plaintext by design: only ratings/notes) ---

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

function addDaysIso(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
function dayOfWeek(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}
export function formatDay(iso: string): string {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return iso;
  return `${DAYS[dayOfWeek(iso)]} ${parts[2]} ${MONTHS[parts[1] - 1]}`;
}
export function shiftDay(iso: string, n: number): string { return addDaysIso(iso, n); }
