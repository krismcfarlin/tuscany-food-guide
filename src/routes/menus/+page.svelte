<script lang="ts">
 import { base } from '$app/paths';
 import { menus, placeById, formatMenuPrice } from '$lib/data';
 let query = ''; let city = 'All'; let onlyPriced = false;
 const allItems = menus.flatMap(menu => menu.items.map((item,index) => ({ ...item, index, placeId:menu.placeId, sourceUrl:menu.sourceUrl, sourcePublishedDate:menu.sourcePublishedDate, retrievedAt:menu.retrievedAt })));
 $: matches = allItems.filter(item => (city === 'All' || placeById.get(item.placeId)?.city === city) && (!onlyPriced || item.price !== null) && [item.name,item.category,placeById.get(item.placeId)?.name || ''].join(' ').toLowerCase().includes(query.toLowerCase()));
</script>
<svelte:head><title>Search Italian menus · Tuscany Food Guide</title></svelte:head>
<section class="pageintro"><p class="eyebrow">ORIGINAL MENU WORDING</p><h1>Search published menus</h1><p>Find dishes as restaurants write them, with prices when available. Prices are historical snapshots, not live quotes. Only extracted menu entries are shown.</p></section>
<div class="controls"><label>Search menu items<input bind:value={query} placeholder="farro, cinghiale, tortelli, steak..."/></label><label>City<select bind:value={city}><option>All</option><option>Florence</option><option>Lucca</option><option>Pisa</option></select></label><label class="check"><input type="checkbox" bind:checked={onlyPriced}/> With published price</label></div>
<p class="muted">{matches.length} menu entries from {menus.length} sourced menus. Menu coverage is still being expanded.</p>
<div class="menu-results">{#each matches as item (item.placeId + '-' + item.index)}
<article class="menu-result">{#if placeById.get(item.placeId)?.imageUrl}<a href="{base}/places/{item.placeId}" class="menu-result-photo"><img src={placeById.get(item.placeId)?.imageUrl} alt="Restaurant: {placeById.get(item.placeId)?.name}" loading="lazy"/></a>{/if}<div class="menu-result-body"><p class="eyebrow">{item.category} · {placeById.get(item.placeId)?.city}</p><h2>{#if item.foodId}<a href="{base}/foods/{item.foodId}">{item.name}</a>{:else}{item.name}{/if}</h2><p><a href="{base}/places/{item.placeId}">{placeById.get(item.placeId)?.name} →</a></p><p class="muted">Menu {item.sourcePublishedDate ? 'dated '+item.sourcePublishedDate : 'date not published'} · checked {item.retrievedAt}</p><a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" class="small-link">Original menu ↗</a></div><div class="menu-result-price">{item.price === null ? 'Price unavailable' : formatMenuPrice(item.price,item.priceUnit)}</div></article>
{/each}</div>
