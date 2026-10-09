import { places } from '$lib/data';
import { error } from '@sveltejs/kit';
export function entries() { return places.map(p => ({ slug: p.id })); }
export function load({ params }: { params: { slug: string } }) { const place = places.find(p => p.id === params.slug); if (!place) error(404, 'Restaurant not found'); return { place }; }
