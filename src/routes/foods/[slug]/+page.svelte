<script lang="ts">
 import { base } from '$app/paths';
 import { evidence, placeById, evidenceRank, directionsUrl } from '$lib/data';
 import { progress, toggleProgress } from '$lib/progress';
 export let data: { dish: { id: string; italianName: string; englishDescription: string; region: string } };
 $: matches = evidence.filter(e => e.foodId === data.dish.id && e.evidenceStatus !== 'unverified').sort((a,b) => evidenceRank(a)-evidenceRank(b));
</script>
<a href="{base}/foods" class="back">← Food dictionary</a><section class="pageintro"><p class="eyebrow">{data.dish.region.toUpperCase()}</p><h1>{data.dish.italianName}</h1><p>{data.dish.englishDescription}</p><button class:active={$progress.tasted.includes(data.dish.id)} onclick={() => toggleProgress('tasted',data.dish.id)}>{$progress.tasted.includes(data.dish.id) ? '✓ I tried this' : 'Mark as tasted'}</button></section>
<h2>Where to find it</h2>{#if matches.length === 0}<p class="needs-research">No restaurant with sourced evidence yet. The dish is included for reference while we research where to eat it.</p>{:else}<div class="cards">{#each matches as item}<article class="card"><span class="tag">{item.evidenceStatus === 'confirmed' ? 'Primary / official source' : 'Third-party report'}</span><h3><a href="{base}/places/{item.placeId}">{placeById.get(item.placeId)?.name ?? 'Unknown place'} →</a></h3><p><strong>On the menu:</strong> {item.menuName}</p><p class="muted">{placeById.get(item.placeId)?.city}</p><div class="actions">{#if item.sourceUrl}<a href={item.sourceUrl} target="_blank" rel="noopener noreferrer">Menu source ↗</a>{/if}{#if placeById.get(item.placeId)}<a href={directionsUrl(placeById.get(item.placeId)!.address)} target="_blank" rel="noopener noreferrer">Directions ↗</a>{/if}</div></article>{/each}</div>{/if}
<p class="legend">Published menus and specialties may change. Confirm availability before visiting.</p>
