<script lang="ts">
 import petsJson from '../../../data/pets.json';

 type Step = { title: string; maps: string; text: string };
 type Spot = { name: string; where: string; why: string; maps: string; coords: number[] | null };
 type City = { id: string; label: string; intro: string; route: { title: string; hint: string; mapsUrl: string; steps: Step[] }; spots: Spot[]; etiquette: { title: string; text: string }[] };
 const cities = (petsJson as { cities: City[] }).cities;

 let cityId = cities[0].id;

 function mapsUrl(q: string) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }
 function pin(s: Spot) { return s.coords ? `https://www.google.com/maps/search/?api=1&query=${s.coords[0]},${s.coords[1]}` : mapsUrl(s.maps); }
 function select(c: City) {
  cityId = c.id;
  const u = new URL(window.location.href);
  u.searchParams.set('city', c.id);
  history.replaceState({}, '', u);
 }

 // Deep link support: /pets?city=lucca opens the Lucca tab.
 if (typeof window !== 'undefined') {
  const want = new URLSearchParams(window.location.search).get('city');
  if (want && cities.some((c) => c.id === want)) cityId = want;
 }
 $: city = cities.find((c) => c.id === cityId) || cities[0];
</script>

<svelte:head><title>Dog-friendly Florence & Lucca · Tuscany Food Guide</title></svelte:head>
<section class="pageintro"><p class="eyebrow">🐾 CON IL CANE</p><h1>With the dog</h1><p>{city.intro}</p></section>

<nav class="subnav" aria-label="Choose city">
 {#each cities as c (c.id)}
  <button class="citytab" class:active={c.id === cityId} aria-pressed={c.id === cityId} onclick={() => select(c)}>🐾 {c.label}</button>
 {/each}
</nav>

<section class="petroute">
 <h2>{city.route.title}</h2>
 <p class="hint">{city.route.hint}</p>
 <div class="steps">
  {#each city.route.steps as st, i (st.title)}
   <div class="step">
    <span class="num">{i + 1}</span>
    <div><strong>{st.title}</strong><p>{st.text}</p>
     <a href={mapsUrl(st.maps)} target="_blank" rel="noopener noreferrer">Map ↗</a></div>
   </div>
  {/each}
 </div>
 <a class="route-open" href={city.route.mapsUrl} target="_blank" rel="noopener noreferrer">Open the whole route in Google Maps ↗</a>
</section>

<h2>Top dog spots in {city.label}</h2>
<div class="petgrid">
 {#each city.spots as s (s.name)}
  <article class="petcard">
   <h3>{s.name}</h3>
   <small>{s.where}</small>
   <p>{s.why}</p>
   <a href={pin(s)} target="_blank" rel="noopener noreferrer">Map ↗</a>
  </article>
 {/each}
</div>

<h2>Local pet etiquette</h2>
<div class="pets">
 {#each city.etiquette as e (e.title)}
  <div class="petrow"><strong>{e.title}</strong><span>{e.text}</span></div>
 {/each}
</div>

<style>
 .subnav{display:flex;gap:8px;margin:2px 0 20px;flex-wrap:wrap}
 .citytab{border:1px solid #cbd5ca;background:white;color:#285a45;border-radius:22px;padding:9px 18px;cursor:pointer;font:inherit;font-weight:700;font-size:.9rem}
 .citytab.active{background:#285a45;color:#fff;border-color:#285a45}
 .petroute{border:1px solid #e0e5db;border-radius:16px;background:white;padding:20px 22px;margin:20px 0 30px}
 .hint{color:#64746b;font-size:.9rem;line-height:1.55}
 .steps{display:grid;gap:12px;margin:14px 0}
 .step{display:flex;gap:12px;align-items:flex-start}
 .num{flex:0 0 26px;height:26px;border-radius:50%;background:#285a45;color:#fff;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:.85rem;margin-top:2px}
 .step strong{display:block;font-size:.95rem}
 .step p{margin:3px 0;font-size:.9rem;color:#41534a;line-height:1.55}
 .step a{font-size:.8rem;font-weight:700}
 .route-open{display:inline-block;margin-top:6px;font-weight:700}
 .petgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,300px),1fr));gap:14px;margin:14px 0 30px}
 .petcard{border:1px solid #e0e5db;border-radius:14px;background:white;padding:16px 18px}
 .petcard h3{margin:0 0 4px}
 .petcard small{color:#4b8060;font-weight:700}
 .petcard p{font-size:.9rem;line-height:1.55;color:#41534a}
 .petcard a{font-size:.85rem;font-weight:700}
 .pets{display:grid;gap:10px}
 .petrow{display:flex;gap:14px;border:1px solid #e0e5db;border-radius:12px;background:white;padding:12px 15px;align-items:baseline}
 .petrow strong{flex:0 0 160px;font-size:.9rem}
 .petrow span{font-size:.9rem;color:#41534a;line-height:1.55}
 @media(max-width:640px){.petrow{flex-direction:column;gap:4px}.petrow strong{flex:none}}
</style>
