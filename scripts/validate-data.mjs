import { readFileSync } from 'node:fs';
const read = (file) => JSON.parse(readFileSync(new URL('../data/' + file, import.meta.url), 'utf8'));
const places = read('restaurants.json'), dishes = read('dishes.json'), evidence = read('restaurant-dishes.json');
const errors = [];
function unique(items, key, label) { const seen = new Set(); for (const item of items) { const id = key(item); if (seen.has(id)) errors.push('Duplicate ' + label + ': ' + id); seen.add(id); } }
unique(places, p => p.id, 'place'); unique(dishes, d => d.id, 'dish'); unique(evidence, e => e.placeId + '/' + e.foodId, 'evidence pair');
const placeIds = new Set(places.map(p => p.id)), dishIds = new Set(dishes.map(d => d.id));
for (const p of places) { if (!p.id || !p.city || !p.address || !['original','suggested'].includes(p.origin)) errors.push('Invalid place ' + p.id); if (p.origin === 'original' && !p.name && p.identityStatus !== 'unidentified') errors.push('Unnamed original place without unresolved status: ' + p.id); }
for (const d of dishes) if (!d.id || !d.italianName || !d.englishDescription) errors.push('Invalid dish ' + d.id);
for (const e of evidence) { if (!placeIds.has(e.placeId)) errors.push('Unknown place ' + e.placeId); if (!dishIds.has(e.foodId)) errors.push('Unknown dish ' + e.foodId); if (!['confirmed','reported','unverified'].includes(e.evidenceStatus)) errors.push('Invalid evidence status ' + e.placeId); if (e.evidenceStatus !== 'unverified' && (!e.sourceUrl || !e.menuName || !e.verifiedAt)) errors.push('Sourced item missing source, menu label or checked date: ' + e.placeId + '/' + e.foodId); if (e.sourceUrl && !/^https:\/\//.test(e.sourceUrl)) errors.push('Invalid URL ' + e.sourceUrl); }
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; } else console.log('Validated ' + places.length + ' places, ' + dishes.length + ' dishes, ' + evidence.length + ' evidence links.');
