import { writable } from 'svelte/store';
export type Progress = { visited: string[]; tasted: string[]; favorites: string[] };
const KEY = 'tuscany-guide-progress-v1';
const initial: Progress = { visited: [], tasted: [], favorites: [] };
function load(): Progress { if (typeof localStorage === 'undefined') return initial; try { const value = JSON.parse(localStorage.getItem(KEY) || '{}'); return { visited: Array.isArray(value.visited) ? value.visited : [], tasted: Array.isArray(value.tasted) ? value.tasted : [], favorites: Array.isArray(value.favorites) ? value.favorites : [] }; } catch { return initial; } }
export const progress = writable<Progress>(initial);
if (typeof window !== 'undefined') { progress.set(load()); progress.subscribe((value) => localStorage.setItem(KEY, JSON.stringify(value))); }
export function toggleProgress(kind: keyof Progress, id: string): void { progress.update((current) => ({ ...current, [kind]: current[kind].includes(id) ? current[kind].filter((item) => item !== id) : [...current[kind], id] })); }
