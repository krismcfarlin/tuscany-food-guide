<script lang="ts">
 import { base } from '$app/paths';
 import { onMount } from 'svelte';
 import { places, dishEvidence, dishById, mapsUrl } from '$lib/data';

 type Place = typeof places[number];
 const withCoords = places.filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number');
 const cities = ['All', ...[...new Set(places.map((p) => p.city))].sort()];
 let city = 'All';
 let onlyOriginal = false;
 let status = 'Loading map…';
 let mapReady = false;

 let map: any; let markers: { place: Place; marker: any }[] = [];

 function color(p: Place) {
   if (p.mapKind === 'home') return '#c0392b';
   if (p.mapKind === 'shop') return '#7d3fa6';
   return p.city === 'Florence' ? '#285a45' : p.city === 'Pisa' ? '#8a4f1d' : p.city === 'Lucca' ? '#1d5a8a' : '#555';
 }
 function popupHtml(p: Place) {
   const dishes = dishEvidence(p.id).filter((e) => e.evidenceStatus !== 'unverified').slice(0, 4)
     .map((e) => e.menuName || dishById.get(e.foodId)?.italianName || '').filter(Boolean);
   const img = p.imageUrl ? `<img src="${p.imageUrl}" alt="" style="width:100%;height:110px;object-fit:cover;border-radius:8px;margin-bottom:6px">` : '';
   const chips = dishes.length ? `<div style="font-size:.78rem;color:#41534a;margin-top:4px">${dishes.join(' · ')}</div>` : '';
   return `<div style="min-width:180px">${img}<strong>${p.name || 'Venue to identify'}</strong>
     <div style="font-size:.8rem;color:#64746b">${p.city}${p.mapKind === 'home' ? ' · apartment' : p.mapKind === 'shop' ? ' · shop / enoteca' : p.origin === 'original' ? ' · your pick' : ''}</div>
     <div style="margin-top:5px;display:flex;gap:10px;font-size:.82rem;font-weight:700">
       <a href="${base}/places/${p.id}">Details →</a>
       <a href="${mapsUrl(p.address)}" target="_blank" rel="noopener">Map ↗</a>
     </div>${chips}</div>`;
 }
 function applyFilters() {
   if (!map) return;
   markers.forEach(({ place, marker }) => {
     const show = (city === 'All' || place.city === city) && (!onlyOriginal || place.origin === 'original');
     if (show && !map.hasLayer(marker)) marker.addTo(map);
     if (!show && map.hasLayer(marker)) map.removeLayer(marker);
   });
   const n = markers.filter(({ place }) => (city === 'All' || place.city === city) && (!onlyOriginal || place.origin === 'original')).length;
   status = `${n} of ${withCoords.length} venues shown`;
 }

 onMount(() => {
   const css = document.createElement('link');
   css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
   document.head.appendChild(css);
   const script = document.createElement('script');
   script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
   script.onload = () => {
     try {
       map = (window as any).L.map('tripmap', { scrollWheelZoom: true }).setView([43.8, 10.8], 9);
       (window as any).L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
         { maxZoom: 19, attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);
       markers = withCoords.map((place) => {
         const marker = (window as any).L.circleMarker([place.latitude!, place.longitude!], {
           radius: place.mapKind === 'home' ? 11 : place.origin === 'original' ? 9 : 7, color: color(place), weight: 2,
           fillColor: place.mapKind === 'home' || place.mapKind === 'shop' || place.origin === 'original' ? color(place) : '#fff', fillOpacity: place.mapKind === 'home' ? 1 : place.origin === 'original' ? 0.85 : 1
         }).bindPopup(() => popupHtml(place));
         return { place, marker };
       });
       mapReady = true;
       applyFilters();
       markers.forEach(({ marker }) => marker.addTo(map));
       map.fitBounds((window as any).L.featureGroup(markers.map((m) => m.marker)).getBounds(), { padding: [30, 30] });
     } catch { status = 'Map failed to load (network blocked?).'; }
   };
   script.onerror = () => { status = 'Could not load the map library (offline?).'; };
   document.head.appendChild(script);
 });
 $: if (mapReady) { city; onlyOriginal; applyFilters(); }
</script>

<svelte:head><title>Trip map · Tuscany Food Guide</title></svelte:head>
<section class="pageintro"><p class="eyebrow">EVERY PIN AT A GLANCE</p><h1>Trip map</h1><p>All {withCoords.length} researched venues on one map. Filled circles are your original picks, hollow ones are research suggestions; colours: <span class="k h">Apartment</span> <span class="k f">Florence</span> <span class="k p">Pisa</span> <span class="k l">Lucca</span> <span class="k s">Shops &amp; enoteca</span>. Tap a pin for photo and links.</p></section>

<div class="controls">
 <label>City<select bind:value={city}>{#each cities as c}<option>{c}</option>{/each}</select></label>
 <label class="check"><input type="checkbox" bind:checked={onlyOriginal} onchange={applyFilters}/> Original picks only</label>
 <span class="muted">{status}</span>
</div>
<div id="tripmap" class="map"></div>

<style>
 .map{height:min(72vh,640px);border:1px solid #e0e5db;border-radius:16px;margin-top:8px;background:#e9e4da}
 .k{display:inline-block;width:11px;height:11px;border-radius:50%;vertical-align:-1px;margin-left:6px}
 .k.h{background:#c0392b}.k.f{background:#285a45}.k.p{background:#8a4f1d}.k.l{background:#1d5a8a}.k.s{background:#7d3fa6}
 :global(.leaflet-container){font:inherit}
</style>
