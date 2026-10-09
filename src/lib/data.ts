import menusJson from '../../data/menus.json';
import restaurantsJson from '../../data/restaurants.json';
import dishesJson from '../../data/dishes.json';
import evidenceJson from '../../data/restaurant-dishes.json';

export type Place = { id: string; name: string | null; city: string; address: string; origin: 'original' | 'suggested'; identityStatus: string; notes?: string; latitude?: number; longitude?: number; imageUrl?: string; imageSourceUrl?: string; imageRightsStatus?: string };
export type Dish = { id: string; italianName: string; englishDescription: string; region: string; aliases?: string[];imageUrl?:string;imageSourceUrl?:string;imageCredit?:string };
export type Evidence = { placeId: string; foodId: string; menuName: string | null; evidenceStatus: 'confirmed' | 'reported' | 'unverified'; sourceUrl: string | null; notes?: string };
export const places = restaurantsJson as Place[];
export const dishes = dishesJson as Dish[];
export const evidence = evidenceJson as Evidence[];
export const dishById = new Map(dishes.map((d) => [d.id, d]));
export const placeById = new Map(places.map((p) => [p.id, p]));
export function dishEvidence(placeId: string): Evidence[] { return evidence.filter((e) => e.placeId === placeId).sort((a,b) => evidenceRank(a)-evidenceRank(b)); }
export function evidenceRank(e: Evidence): number { return e.evidenceStatus === 'confirmed' ? 0 : e.evidenceStatus === 'reported' ? 1 : 2; }
export function mapsUrl(address: string): string { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(address); }
export function directionsUrl(address: string): string { return 'https://www.google.com/maps/dir/?api=1&destination=' + encodeURIComponent(address) + '&travelmode=walking'; }

export type MenuItem = { category:string;name:string;price:number|null;priceUnit:string;foodId:string|null };
export type Menu = { placeId:string;sourceUrl:string;sourceType:string;sourcePublishedDate:string|null;retrievedAt:string;currency:string;extractionMethod:string;items:MenuItem[] };
export const menus = menusJson as Menu[];
export function menuItemsForDish(foodId:string){return menus.flatMap(menu => menu.items.filter(item=>item.foodId===foodId).map(item=>({ ...item,placeId:menu.placeId,sourceUrl:menu.sourceUrl,sourcePublishedDate:menu.sourcePublishedDate,retrievedAt:menu.retrievedAt })));}
export function menuForPlace(placeId:string){return menus.find(m=>m.placeId===placeId);}
export function formatMenuPrice(price:number,unit='item'){return new Intl.NumberFormat('en-IE',{style:'currency',currency:'EUR'}).format(price)+(unit==='kg'?' / kg':'');}
