import { readFileSync } from 'node:fs';
const read = (file) => JSON.parse(readFileSync(new URL('../data/' + file, import.meta.url), 'utf8'));
const places = read('restaurants.json'), dishes = read('dishes.json'), evidence = read('restaurant-dishes.json');
const menus = read('menus.json');
const errors = [];
function unique(items, key, label) { const seen = new Set(); for (const item of items) { const id = key(item); if (seen.has(id)) errors.push('Duplicate ' + label + ': ' + id); seen.add(id); } }
unique(places, p => p.id, 'place'); unique(dishes, d => d.id, 'dish'); unique(evidence, e => e.placeId + '/' + e.foodId, 'evidence pair');
const placeIds = new Set(places.map(p => p.id)), dishIds = new Set(dishes.map(d => d.id));
for (const p of places) { if (!p.id || !p.city || !p.address || !['original','suggested'].includes(p.origin)) errors.push('Invalid place ' + p.id); if (p.origin === 'original' && !p.name && p.identityStatus !== 'unidentified') errors.push('Unnamed original place without unresolved status: ' + p.id); }
for (const d of dishes) if (!d.id || !d.italianName || !d.englishDescription) errors.push('Invalid dish ' + d.id);
for (const e of evidence) { if (!placeIds.has(e.placeId)) errors.push('Unknown place ' + e.placeId); if (!dishIds.has(e.foodId)) errors.push('Unknown dish ' + e.foodId); if (!['confirmed','reported','unverified'].includes(e.evidenceStatus)) errors.push('Invalid evidence status ' + e.placeId); if (e.evidenceStatus !== 'unverified' && (!e.sourceUrl || !e.menuName || !e.verifiedAt)) errors.push('Sourced item missing source, menu label or checked date: ' + e.placeId + '/' + e.foodId); if (e.sourceUrl && !/^https:\/\//.test(e.sourceUrl)) errors.push('Invalid URL ' + e.sourceUrl); }
unique(menus, m => m.placeId, 'menu snapshot restaurant');
for (const m of menus) {
 if (!placeIds.has(m.placeId)) errors.push('Unknown menu restaurant '+m.placeId);
 if (!/^https:\/\//.test(m.sourceUrl || '')) errors.push('Missing/invalid menu source '+m.placeId);
 if (m.currency !== 'EUR') errors.push('Unexpected currency '+m.placeId);
 if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(m.retrievedAt || '')) errors.push('Invalid menu retrieval date '+m.placeId);
 if (!Array.isArray(m.items) || m.items.length === 0) errors.push('Empty menu '+m.placeId);
 for (const item of m.items || []) {
  if (!item.name || !item.category) errors.push('Incomplete menu item '+m.placeId);
  if (item.foodId !== null && !dishIds.has(item.foodId)) errors.push('Unknown menu dish '+m.placeId+'/'+item.foodId);
  if (item.price !== null && (typeof item.price !== 'number' || !Number.isFinite(item.price) || item.price < 0)) errors.push('Invalid menu price '+m.placeId+'/'+item.name);
  if (!['item','kg','100g','person'].includes(item.priceUnit)) errors.push('Invalid menu price unit '+m.placeId+'/'+item.name);
 }
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log('Validated ' + places.length + ' places, ' + dishes.length + ' dishes, ' + evidence.length + ' evidence links, ' + menus.length + ' menu snapshots.');
