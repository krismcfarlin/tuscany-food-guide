<script lang="ts">
 import petsJson from '../../../data/pets.json';

 type Step = { title: string; maps: string; text: string };
 type Spot = { name: string; where: string; why: string; maps: string };
 const pets = petsJson as {
   intro: string;
   route: { title: string; hint: string; mapsUrl: string; steps: Step[] };
   spots: Spot[];
   etiquette: { title: string; text: string }[];
 };

 function mapsUrl(q: string) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }
 function pin(lat: number, lng: number) { return "https://www.google.com/maps/search/?api=1&query=" + lat + "," + lng; }

 const coords: Record<string, [number, number]> = {
  "Area Cani Carraia": [43.76198, 11.25583],
  "Parco delle Cascine": [43.77586, 11.23084],
  "Orti del Parnaso": [43.78342, 11.26444],
  "Piazza della Repubblica": [43.77067, 11.25449]
 };
</script>

<svelte:head><title>Dog-friendly Florence · Tuscany Food Guide</title></svelte:head>
<section class="pageintro"><p class="eyebrow">🐾 CON IL CANE</p><h1>Florence with the dog</h1><p>{pets.intro}</p></section>

<section class="petroute">
 <h2>{pets.route.title}</h2>
 <p class="hint">{pets.route.hint}</p>
 <div class="steps">
  {#each pets.route.steps as st, i (st.title)}
   <div class="step">
    <span class="num">{i + 1}</span>
    <div><strong>{st.title}</strong><p>{st.text}</p>
     <a href={mapsUrl(st.maps)} target="_blank" rel="noopener noreferrer">Map ↗</a></div>
   </div>
  {/each}
 </div>
 <a class="route-open" href={pets.route.mapsUrl} target="_blank" rel="noopener noreferrer">Open the whole route in Google Maps ↗</a>
</section>

<h2>Top dog spots</h2>
<div class="petgrid">
 {#each pets.spots as s (s.name)}
  <article class="petcard">
   <h3>{s.name}</h3>
   <small>{s.where}</small>
   <p>{s.why}</p>
   <a href={coords[s.name] ? pin(...coords[s.name]) : mapsUrl(s.maps)} target="_blank" rel="noopener noreferrer">Map ↗</a>
  </article>
 {/each}
</div>

<h2>Local pet etiquette</h2>
<div class="pets">
 {#each pets.etiquette as e (e.title)}
  <div class="petrow"><strong>{e.title}</strong><span>{e.text}</span></div>
 {/each}
</div>

<style>
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
