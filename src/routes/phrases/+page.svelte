<script lang="ts">
 import phrasesJson from '../../../data/phrases.json';
 import { onMount } from 'svelte';

 type Phrase = { en: string; it: string };
 type Scenario = { id: string; title: string; hint: string; phrases: Phrase[] };
 const scenarios = phrasesJson as Scenario[];

 let query = ''; let open: Record<string, boolean> = {}; let copied = '';
 onMount(() => { open = { [scenarios[0].id]: true }; open = { ...open }; });

 $: filtered = scenarios.map((s) => {
   const q = query.trim().toLowerCase();
   const phrases = !q ? s.phrases : s.phrases.filter((p) => (p.en + ' ' + p.it).toLowerCase().includes(q));
   return { ...s, phrases };
 }).filter((s) => s.phrases.length > 0);
 $: totalShown = filtered.reduce((n, s) => n + s.phrases.length, 0);

 async function copy(it: string) {
   try { await navigator.clipboard.writeText(it); } catch {
     const ta = document.createElement('textarea'); ta.value = it; document.body.appendChild(ta); ta.select();
     document.execCommand('copy'); ta.remove();
   }
   copied = it; setTimeout(() => { if (copied === it) copied = ''; }, 1600);
 }
</script>

<svelte:head><title>Frasi utili · Tuscany Food Guide</title></svelte:head>
<section class="pageintro"><p class="eyebrow">10 SCENARIOS · 200 PHRASES</p><h1>Frasi utili</h1><p>Useful Italian for the trip, grouped by situation. Tap any phrase to copy it — paste it into the translator app or just show the screen. English first, then what to say.</p></section>

<div class="controls">
 <label>Search English or Italian<input bind:value={query} placeholder="e.g. bill, conto, allergy, pharmacy…"/></label>
 <span class="legend">{totalShown} phrases shown</span>
 {#if query}<button class="clearq" onclick={() => (query = '')}>clear</button>{/if}
</div>
{#if copied}<p class="copied" role="status">Copied: “{copied}” — show the screen or paste it</p>{/if}

{#each filtered as s (s.id)}
 <section class="scen">
  <h2><button class="shead" aria-expanded={!!open[s.id]} onclick={() => (open = { ...open, [s.id]: !open[s.id] })}>
   {s.title}<span class="chev">{open[s.id] ? '▾' : '▸'}</span>
  </button></h2>
  {#if !open[s.id] && !query.trim() && s.phrases.length}<p class="legend">Tap to open — {s.phrases.length} {s.phrases.length === 1 ? 'phrase' : 'phrases'}</p>{/if}
  {#if open[s.id] || query.trim()}
   <p class="hint">{s.hint}</p>
   <div class="phrase-grid">
    {#each s.phrases as p (p.en)}
     <button class="phrase" class:justcopied={copied === p.it} onclick={() => copy(p.it)} aria-label={`Copy Italian phrase: ${p.it}`}>
      <strong>{p.it}</strong><span>{p.en}</span>
     </button>
    {/each}
   </div>
  {/if}
 </section>
{/each}
{#if filtered.length === 0}<p class="empty">Nothing matches “{query}”.</p>{/if}

<style>
 .clearq{border:0;background:#e5ede5;color:#285a45;border-radius:9px;padding:10px 14px;cursor:pointer;font:inherit;font-weight:600;margin-bottom:12px}
 .copied{color:#285a45;font-weight:700;background:#eef5ec;border-radius:10px;padding:9px 13px}
 .scen{margin:26px 0}
 .shead{display:flex;justify-content:space-between;align-items:center;width:100%;border:1px solid #e0e5db;background:white;border-radius:14px;padding:15px 18px;cursor:pointer;font:inherit;text-align:left}
 .shead:hover{border-color:#285a45}
 h2{margin:0;font-size:1.3rem}
 .chev{color:#4b8060;font-size:.9rem}
 .hint{color:#64746b;font-size:.88rem;margin:10px 4px 12px;line-height:1.55}
 .phrase-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,330px),1fr));gap:11px}
 .phrase{border:1px solid #e0e5db;border-radius:13px;background:white;padding:13px 15px;cursor:pointer;text-align:left;font:inherit;display:block;transition:border-color .12s ease}
 .phrase:hover{border-color:#285a45}
 .phrase strong{display:block;font-size:1.02rem;color:#245b46;line-height:1.4}
 .phrase span{display:block;font-size:.84rem;color:#64746b;margin-top:3px}
 .justcopied{border-color:#b98a2f;background:#fdf8ee}
 .empty{background:#f6f2e8;color:#7d6335;padding:14px;border-radius:12px}
 @media (prefers-color-scheme:dark){ }
</style>
