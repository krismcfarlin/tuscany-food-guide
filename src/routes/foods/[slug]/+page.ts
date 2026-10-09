import { dishes } from '$lib/data';
import { error } from '@sveltejs/kit';
export function entries() { return dishes.map((dish) => ({ slug: dish.id })); }
export function load({ params }: { params: { slug: string } }) { const dish = dishes.find((d) => d.id === params.slug); if (!dish) error(404, 'Dish not found'); return { dish }; }
