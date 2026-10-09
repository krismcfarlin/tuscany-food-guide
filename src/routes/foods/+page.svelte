<script lang="ts">
 import { base } from '$app/paths';
 import { dishes, evidence, placeById } from '$lib/data';
 let query = ''; let region = 'All'; let withPlaces = false;
 const count = (id: string) => new Set(evidence.filter(e => e.foodId === id && e.evidenceStatus !== 'unverified').map(e => e.placeId)).size;
 const restaurants = (id: string) => [...new Set(evidence.filter(e => e.foodId === id && e.evidenceStatus !== 'unverified').map(e => e.placeId))].map(id => placeById.get(id)).filter((p): p is NonNullable<typeof p> => !!p);
 $: shown = dishes.filter(d => (region === 'All' || d.region === region) && (!withPlaces || count(d.id) > 0) && [d.italianName,d.englishDescription,...(d.aliases || [])].join(' ').toLowerCase().includes(query.toLowerCase())).sort((a,b) => count(b.id)-count(a.id) || a.italianName.localeCompare(b.italianName));
</script>
<section class="pageintro"><p class="eyebrow">THE MENU TRANSLATOR</p><h1>Italian food dictionary</h1><p>Every food is linked to restaurants when we have published evidence. Tap a restaurant name to see its address and other dishes.</p></section>
<div class="controls"><label>Search Italian or English<input bind:value={query} placeholder="e.g. cinghiale, wild boar, cecina"/></label><label>Region<select bind:value={region}><option>All</option>{#each [...new Set(dishes.map(d => d.region))].sort() as r}<option>{r}</option>{/each}</select></label><label class="check"><input type="checkbox" bind:checked={withPlaces}/> Show only foods with sourced places</label></div>

<p class="muted">{shown.length} foods · {shown.filter(d => count(d.id) > 0).length} with sourced restaurants</p>
<div class="cards">{#each shown as dish (dish.id)}<article class="card foodcard"><span class="tag">{dish.region}</span><h2><a href="{base}/foods/{dish.id}">{dish.italianName}</a></h2><p>{dish.englishDescription}</p>{#if count(dish.id) > 0}<p class="sourcecount">{count(dish.id)} sourced place{count(dish.id) === 1 ? '' : 's'}</p><ul class="restaurant-links">{#each restaurants(dish.id).slice(0,4) as place}<li><a href="{base}/places/{place.id}">{place.name}</a> <small>· {place.city}</small></li>{/each}</ul>{:else}<p class="needs-research">Where to eat: still researching</p>{/if}<a href="{base}/foods/{dish.id}" class="prominent-link">Dish details →</a></article>{/each}</div>
