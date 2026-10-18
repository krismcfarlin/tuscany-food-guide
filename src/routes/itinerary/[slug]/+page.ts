export const prerender = true;
import type { PageLoad, EntryGenerator } from './$types';

const files = import.meta.glob('../../../../data/itineraries/*.json', { eager: true }) as Record<string, { default: unknown }>;

export const entries: EntryGenerator = () =>
  Object.keys(files).map((p) => ({ slug: p.split('/').pop()!.replace('.json', '') }));

export const load: PageLoad = ({ params }) => {
  const key = `../../../../data/itineraries/${params.slug}.json`;
  const mod = files[key];
  return { itinerary: mod ? mod.default : null };
};
