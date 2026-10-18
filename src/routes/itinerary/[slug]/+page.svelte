<script lang="ts">
 import { base } from '$app/paths';
 import { onMount } from 'svelte';
 import type { PageData } from './$types';
 export let data: PageData;

 type Stop = { time: string; name: string; coords: number[]; walk: string | null; note: string };
 type itin = { id: string; title: string; day: string; subtitle: string; excluded?: string;
   alert?: { title: string; text: string }; transfers?: { mode: string; text: string }[];
   stops: Stop[]; mapsRouteUrl?: string };

 const it = data.itinerary as itin | null;
 let mapOk = false;
 let status = '';
 let chosen = 0;

 function pinUrl(c: number[]) { return `https://www.google.com/maps/search/?api=1&query=${c[0]},${c[1]}`; }

 onMount(() => {
   if (!it) return;
   const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
   document.head.appendChild(css);
   const jsEl = document.createElement('script'); jsEl.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
   jsEl.onload = () => {
     try {
       const L = (window as any).L;
       const pts = it.stops.filter((s) => s.coords).map((s) => [s.coords[0], s.coords[1]] as [number, number]);
       const map = L.map('itinmap', { scrollWheelZoom: false }).fitBounds([pts], { padding: [36, 36] });
       L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
         { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
       // dedupe consecutive identical coordinates (e.g. centrale used 3x) for the polyline
       const line: [number, number][] = [];
       it.stops.forEach((s) => {
         const c = [s.coords[0], s.coords[1]] as [number, number];
         if (!line.length || line[line.length - 1][0] !== c[0] || line[line.length - 1][1] !== c[1]) line.push(c);
       });
       L.polyline(line, { color: '#285a45', weight: 3, opacity: .7, dashArray: '6 8' }).addTo(map);
       it.stops.forEach((s, i) => {
         const m = L.circleMarker([s.coords[0], s.coords[1]], {
           radius: 11, color: '#285a45', weight: 2, fillColor: i === chosen ? '#c0392b' : '#fff', fillOpacity: 1 })
           .bindTooltip(`${s.time} · ${s.name}`, { direction: 'top' })
           .bindPopup(() => `<strong>${s.time} — ${s.name}</strong><br>${s.note}<br><a href="${pinUrl(s.coords)}" target="_blank" rel="noopener">Open in Google Maps ↗</a>`);
         m.on('click', () => { chosen = i; const t = document.getElementById(`stop-${i}`); t?.scrollIntoView({ behavior: 'smooth', block: 'center' }); });
         m.addTo(map);
       });
       mapOk = true;
     } catch { status = 'Map failed to load.'; }
   };
   jsEl.onerror = () => { status = 'Could not load the map (offline?).'; };
   document.head.appendChild(jsEl);
 });

 function pick(i: number) { chosen = i; }
</script>

<svelte:head><title>{it ? it.title : 'Itinerary'} · Tuscany Food Guide</title></svelte:head>
{#if !it}
 <p class="needs-research">No itinerary here.</p>
 <a href="{base}/">Back to places →</a>
{:else}
 <section class="pageintro">
  <p class="eyebrow">{new Date(it.day + 'T00:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }).toUpperCase()}</p>
  <h1>{it.title}</h1>
  <p>{it.subtitle}</p>
 </section>

 {#if it.alert}
  <div class="alertcard"><h2>⚠ {it.alert.title}</h2><p>{it.alert.text}</p></div>
 {/if}
 {#if it.excluded}
  <p class="excluded">🚫 {it.excluded}</p>
 {/if}

 <div class="itwrap">
  <div class="itmapcol">
   <div id="itinmap" class="itmap" class:ok={mapOk}></div>
   {#if status}<p class="muted">{status}</p>{/if}
   {#if !mapOk && !status}<p class="muted">Loading map…</p>{/if}
   {#if it.mapsRouteUrl}
    <a class="route-open" href={it.mapsRouteUrl} target="_blank" rel="noopener noreferrer">Open walking route in Google Maps ↗</a>
   {/if}
   {#if it.transfers}
    <h2 class="th">Transfers</h2>
    {#each it.transfers as tr}<div class="transfer"><strong>{tr.mode}</strong><span>{tr.text}</span></div>{/each}
   {/if}
  </div>

  <ol class="timeline">
   {#each it.stops as s, i (s.time + s.name)}
    <li><button id="stop-{i}" class="tlstop" class:active={chosen === i} onclick={() => pick(i)}>
     <div class="tltimeside"><strong>{s.time}</strong>{#if s.walk}<small>{s.walk}</small>{/if}</div>
     <div class="tlbody">
      <h3><a href={pinUrl(s.coords)} target="_blank" rel="noopener noreferrer" onclick={(e) => e.stopPropagation()}>{s.name} ↗</a></h3>
      <p>{s.note}</p>
     </div>
    </button></li>
   {/each}
  </ol>
 </div>

 <p class="legend"><a href="{base}/journal">← Trip journal</a> · <a href="{base}/map">Full trip map</a></p>
{/if}

<style>
 .alertcard{border:1px solid #d9a441;background:#fdf6e3;border-radius:16px;padding:16px 20px;margin:8px 0 18px}
 .alertcard h2{margin:0 0 6px;font-size:1.1rem;color:#8a5a12}
 .alertcard p{margin:0;line-height:1.6;font-size:.95rem}
 .excluded{color:#7d6335;font-size:.92rem;margin:0 0 18px}
 .itwrap{display:grid;grid-template-columns:minmax(280px,1fr) minmax(300px,1.3fr);gap:22px;align-items:start}
 @media(max-width:900px){.itwrap{grid-template-columns:1fr}}
 .itmap{height:430px;border:1px solid #e0e5db;border-radius:16px;background:#e9e4da}
 .itmap.ok{background:#fff}
 .route-open{display:inline-block;margin-top:10px;font-weight:700}
 .th{margin:18px 0 8px;font-size:1.1rem}
 .transfer{border:1px solid #e0e5db;border-radius:12px;background:white;padding:10px 14px;margin:8px 0;display:flex;gap:12px;align-items:baseline}
 .transfer strong{flex:0 0 90px;color:#285a45}
 .transfer span{font-size:.9rem;line-height:1.5}
 .timeline{list-style:none;margin:0;padding:0;display:grid;gap:10px}
 .tlstop{display:flex;gap:14px;text-align:left;font:inherit;width:100%;cursor:pointer;border:1px solid #e0e5db;border-radius:14px;background:white;padding:12px 14px;cursor:pointer}
 .tlstop:hover{border-color:#285a45}
 .tlstop.active{border-color:#285a45;background:#eef5ec}
 .tltimeside{flex:0 0 86px;display:flex;flex-direction:column;gap:2px}
 .tltimeside strong{color:#285a45;font-size:.92rem}
 .tltimeside small{color:#8aa096;font-size:.74rem}
 .tlbody h3{margin:0 0 4px;font-size:1rem}
 .tlbody h3 a{color:inherit;text-decoration:none}
 .tlbody h3 a:hover{text-decoration:underline}
 .tlbody p{margin:0;font-size:.88rem;color:#41534a;line-height:1.55}
 :global(.leaflet-container){font:inherit}
</style>
