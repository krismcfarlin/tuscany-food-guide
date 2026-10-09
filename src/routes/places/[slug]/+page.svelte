<script lang="ts">
 import { base } from '$app/paths';
 import { dishEvidence, dishById, directionsUrl, mapsUrl } from '$lib/data';
 import { progress, toggleProgress } from '$lib/progress';
 export let data: { place: {id:string;name:string|null;city:string;address:string;origin:string;identityStatus:string;notes?:string;imageUrl?:string;imageSourceUrl?:string} };
 $: items = dishEvidence(data.place.id);
 $: sourced = items.filter(e => e.evidenceStatus !== 'unverified');
</script>
<a href="{base}/?city={encodeURIComponent(data.place.city)}" class="back">← {data.place.city} restaurants</a>
{#if data.place.imageUrl}<figure class="place-photo"><img src={data.place.imageUrl} alt="Photograph of {data.place.name}" loading="eager"/>{#if data.place.imageSourceUrl}<figcaption><a href={data.place.imageSourceUrl} target="_blank" rel="noopener noreferrer">Photo source ↗</a></figcaption>{/if}</figure>{/if}<section class="pageintro"><p class="eyebrow">{data.place.city.toUpperCase()} · {data.place.origin === 'original' ? 'YOUR ORIGINAL PICK' : 'RESEARCH SUGGESTION'}</p><h1>{data.place.name || 'Unidentified restaurant'}</h1><p>{data.place.address}</p><div class="actions"><a href={directionsUrl(data.place.address)} target="_blank" rel="noopener noreferrer">Walking directions ↗</a><a href={mapsUrl(data.place.address)} target="_blank" rel="noopener noreferrer">Open map ↗</a><button class:active={$progress.visited.includes(data.place.id)} onclick={() => toggleProgress('visited',data.place.id)}>{$progress.visited.includes(data.place.id) ? '✓ Visited' : 'Mark visited'}</button><button class:active={$progress.favorites.includes(data.place.id)} onclick={() => toggleProgress('favorites',data.place.id)}>{$progress.favorites.includes(data.place.id) ? '♥ Saved' : '♡ Save'}</button></div></section>
<h2>Italian dishes at this place</h2>
{#if sourced.length === 0}<p class="needs-research">No individually sourced dishes yet. This restaurant is included in the guide, but its menu still needs checking.</p>{:else}
<div class="cards">{#each sourced as item}<article class="card"><span class="tag">{item.evidenceStatus === 'confirmed' ? 'Primary / official source' : 'Third-party report'}</span><h3><a href="{base}/foods/{item.foodId}">{dishById.get(item.foodId)?.italianName || item.menuName}</a></h3><p><strong>Menu wording:</strong> {item.menuName}</p>{#if item.notes}<p class="muted">{item.notes}</p>{/if}{#if item.sourceUrl}<a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">View evidence ↗</a>{/if}</article>{/each}</div>{/if}
{#if data.place.notes}<h2>Research notes</h2><p>{data.place.notes}</p>{/if}
<p class="legend">Menu listings are evidence of a published specialty, not a guarantee of availability today.</p>
