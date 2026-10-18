<script lang="ts">
 import { base } from '$app/paths';
 import { onMount } from 'svelte';
 import { places, dishes, evidence, placeById, dishById, dishEvidence, mapsUrl, directionsUrl } from '$lib/data';
 import { progress, toggleProgress } from '$lib/progress';
 import { journal, journalReady, entryFor, setEntry, removeEntry, formatDay, bookingsCipher, bookingsStore, decryptBookings, rememberPassphrase, forgetPassphrase, rememberedPassphrase, type JournalEntry, type Booking } from '$lib/journal';

 let start = '2026-10-19'; let nights = 5; let days: string[] = [];
 let openDay = 0;
 let pickerFor: { day: string; meal: 'lunch' | 'dinner' } | null = null;
 let draftNote = ''; let draftRating = 0;
 let search = '';
 let msg = '';
 let pass = ''; let unlocking = false; let unlockError = '';

 onMount(() => {
   journalReady(); rebuild();
   const saved = rememberedPassphrase();
   if (saved) { pass = saved; unlock(); }
 });
 async function unlock() {
   unlocking = true; unlockError = '';
   try {
     bookingsStore.set(await decryptBookings(bookingsCipher, pass));
     rememberPassphrase(pass);
   } catch { unlockError = 'Wrong key — that passphrase does not open the bookings.'; bookingsStore.set(null); }
   finally { unlocking = false; }
 }
 function lock() { forgetPassphrase(); bookingsStore.set(null); pass = ''; unlockError = ''; }
 function addDaysIso(iso: string, n: number): string {
   const [y, m, d] = iso.split('-').map(Number);
   return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
 }
 function rebuild() {
   days = Array.from({ length: Math.max(1, Math.min(nights + 1, 30)) }, (_, i) => addDaysIso(start, i));
 }

 $: booked = $bookingsStore || [];
 $: byDay = $journal && days.map((day) => ({ day, lunch: $journal.find((e) => e.day === day && e.meal === 'lunch'), dinner: $journal.find((e) => e.day === day && e.meal === 'dinner'), booked: booked.filter((b) => b.day === day).sort((a, b) => a.sort.localeCompare(b.sort)) }));
 $: entries = $journal.slice().sort((a, b) => a.day.localeCompare(b.day) || (a.meal === 'lunch' ? -1 : 1));
 $: placesVisited = new Set($journal.map((e) => e.placeId));
 $: dishesEaten = new Set($journal.flatMap((e) => { const p = placeById.get(e.placeId); return p ? dishEvidence(p.id).map((ev) => ev.foodId) : []; }));
 $: pickerPlaces = places.filter((p) => [p.name || '', p.address, p.city].join(' ').toLowerCase().includes(search.toLowerCase()))
   .sort((a, b) => (b.origin === 'original' ? 1 : 0) - (a.origin === 'original' ? 1 : 0) || a.city.localeCompare(b.city) || (a.name || '').localeCompare(b.name || ''));

 function save(placeId: string) {
   if (!pickerFor) return;
   const entry: JournalEntry = { day: pickerFor.day, meal: pickerFor.meal, placeId, note: draftNote.trim(), rating: draftRating };
   setEntry(entry);
   if (!$progress.visited.includes(placeId)) toggleProgress('visited', placeId);
   for (const ev of dishEvidence(placeId)) {
    if (ev.evidenceStatus !== 'unverified' && !$progress.tasted.includes(ev.foodId)) toggleProgress('tasted', ev.foodId);
   }
   pickerFor = null; draftNote = ''; draftRating = 0; msg = '';
 }
 function clear(day: string, meal: 'lunch' | 'dinner') { removeEntry(day, meal); }
 function editDay(day: string, meal: 'lunch' | 'dinner') {
   const existing = entryFor(day, meal);
   draftNote = existing?.note || ''; draftRating = existing?.rating || 0;
   pickerFor = { day, meal }; search = ''; msg = '';
 }
 function newSlot(day: string, meal: 'lunch' | 'dinner') { draftNote = ''; draftRating = 0; pickerFor = { day, meal }; search = ''; }
 const meals: Array<'lunch' | 'dinner'> = ['lunch', 'dinner'];
 function placeName(id: string) { return placeById.get(id)?.name || id; }

 function download() {
   const blob = new Blob([JSON.stringify({ start, nights, entries: $journal }, null, 1)], { type: 'application/json' });
   const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `tuscany-journal-${start}.json`; a.click(); URL.revokeObjectURL(a.href);
 }
 function restore(text: string) {
   try {
     const parsed = JSON.parse(text); const list = Array.isArray(parsed) ? parsed : parsed.entries;
     if (!Array.isArray(list)) return;
     journal.set(list); if (parsed.start) { start = parsed.start; nights = parsed.nights || nights; rebuild(); }
     msg = 'Journal restored.';
   } catch { msg = 'Could not read that file.'; }
 }
 function fileChosen(event: Event) {
   const f = (event.target as HTMLInputElement).files?.[0]; if (!f) return;
   const r = new FileReader(); r.onload = () => restore(String(r.result)); r.readAsText(f);
 }
</script>

<svelte:head><title>Trip journal · Tuscany Food Guide</title></svelte:head>
<section class="pageintro"><p class="eyebrow">EAT · NOTE · REMEMBER</p><h1>Trip journal</h1><p>Plan one lunch and one dinner per day, or fill it in as you travel. Notes are stored on this device; export the journal to keep or move it.</p></section>

<div class="controls journaledit">
 <label>Trip starts<input type="date" bind:value={start} onchange={rebuild}/></label>
 <label>Days on the ground<input type="number" min="1" max="29" bind:value={nights} onchange={rebuild}/></label>
 <span class="jstats">{entries.length} meals logged · {placesVisited.size} places · {dishesEaten.size} dishes ticked</span>
 <button class="jbtn" onclick={download}>Export journal</button>
 <label class="jbtn restore">Restore<input type="file" accept="application/json" onchange={fileChosen}/></label>
</div>
{#if msg}<p class="jmsg">{msg}</p>{/if}

{#if !$bookingsStore}
 <div class="junlock">
  <span>🔒 Confirmed bookings (flights, apartment, tour, dinner) are stored encrypted on this page.</span>
  <label>Passphrase<input type="password" bind:value={pass} onkeydown={(e) => e.key === 'Enter' && unlock()} placeholder="type your key and press Enter" autocomplete="off"/></label>
  <button class="jbtn" disabled={unlocking || !pass} onclick={unlock}>{unlocking ? 'Unlocking…' : 'Unlock'}</button>
 </div>
 {#if unlockError}<p class="jerror">{unlockError}</p>{/if}
{:else}
 <div class="junlock jlocked">
  <span>🔓 Bookings unlocked</span>
  <button onclick={lock}>Lock again</button>
 </div>
{/if}

<div class="jgrid">
{#each byDay as slot, i (slot.day)}
 <article class="jday" class:today={i === openDay}>
  <h3>{formatDay(slot.day)}<button class="jedit" aria-label="Edit day" onclick={() => { openDay = i; }}>✎</button></h3>
  {#each slot.booked as b (b.title)}
   <div class="jbooked">
    <span class="jtag">BOOKED</span>
    <strong>{b.title}</strong>
    <small>{b.time}</small>
    {#if b.address}<p class="jaddr">{b.address}</p>{/if}
    {#if b.note}<p class="jnote">{b.note}</p>{/if}
    <div class="jacts2">
     {#if b.address}<a href={directionsUrl(b.address, b.travel === 'train' ? 'transit' : (b.travel || 'walking'))} target="_blank" rel="noopener noreferrer">{b.travel === 'driving' ? 'Directions (drive) ↗' : b.travel === 'flight' ? 'Airport ↗' : b.travel === 'train' ? 'Station ↗' : 'Walk there ↗'}</a>{/if}
     {#if b.address}<a href={mapsUrl(b.address)} target="_blank" rel="noopener noreferrer">Map ↗</a>{/if}
     {#if b.activityUrl}<a href={b.activityUrl} target="_blank" rel="noopener noreferrer">Booking details ↗</a>{/if}
     {#if b.url}<a href={b.url} target="_blank" rel="noopener noreferrer">Manage booking ↗</a>{/if}
    </div>
   </div>
  {/each}
  {#each meals as meal}
   {@const e = meal === 'lunch' ? slot.lunch : slot.dinner}
   <div class="jslot">
    <span class="jmeal">{meal}</span>
    {#if e}
     <div class="jentry">
      <a href="{base}/places/{e.placeId}">{placeName(e.placeId)}</a>
      {#if e.rating}<span class="jstars" aria-label={`${e.rating} of 5`}>{'★'.repeat(e.rating)}{'☆'.repeat(5 - e.rating)}</span>{/if}
      {#if e.note}<p class="jnote">{e.note}</p>{/if}
      <div class="jacts"><button onclick={() => editDay(slot.day, meal)}>change</button><button onclick={() => clear(slot.day, meal)}>clear</button></div>
     </div>
    {:else}
     <button class="jempty" onclick={() => newSlot(slot.day, meal)}>+ {meal}</button>
    {/if}
   </div>
  {/each}
 </article>
{/each}
</div>

{#if pickerFor}
 <div class="jpicker" role="dialog" aria-label="Choose a place for {pickerFor.meal}">
  <div class="jpickhead"><strong>{formatDay(pickerFor.day)} · {pickerFor.meal}</strong>
   <label class="jsearch">Search places<input bind:value={search} placeholder="name, street, city…"/></label>
   <button onclick={() => (pickerFor = null)}>close</button></div>
  <div class="jeditrow">
    <label>Note <input bind:value={draftNote} placeholder="booked for 8 · pappardelle al cinghiale · cash only…"/></label>
    <label>Rating <select bind:value={draftRating}><option value={0}>—</option><option value={1}>1</option><option value={2}>2</option><option value={3}>3</option><option value={4}>4</option><option value={5}>5</option></select></label>
  </div>
  <div class="jlist">
  {#each pickerPlaces as p (p.id)}
   <button class="jplace" onclick={() => save(p.id)}>
    {#if p.imageUrl}<img src={p.imageUrl} alt="" loading="lazy"/>{/if}
    <span><strong>{p.name}</strong><small>{p.city} · {p.origin === 'original' ? 'your pick' : 'suggested'}{dishEvidence(p.id).filter(ev => ev.evidenceStatus !== 'unverified').length ? ' · ' + dishEvidence(p.id).filter(ev => ev.evidenceStatus !== 'unverified').map(ev => ev.menuName || dishById.get(ev.foodId)?.italianName).join(', ') : ''}</small></span>
    {#if placesVisited.has(p.id)}<span class="jdone">already logged</span>{/if}
   </button>
  {/each}
  </div>
 </div>
{/if}

<style>
 .journaledit{align-items:end}
 .jstats{font-size:.88rem;color:#64746b;padding-bottom:14px}
 .jbtn{background:#285a45;color:white;border:0;border-radius:9px;padding:12px 16px;cursor:pointer;font:inherit;font-weight:600}
 .jbtn.restore{position:relative;overflow:hidden}
 .jbtn.restore input{position:absolute;inset:0;opacity:0;cursor:pointer}
 .jmsg{color:#285a45;font-weight:600}
 .jgrid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:12px;margin:18px 0 30px}
@media(max-width:1180px){.jgrid{grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}}
 .jday{border:1px solid #e0e5db;border-radius:14px;background:white;padding:12px 12px;min-width:0}
 .jday.today{border-color:#285a45;box-shadow:0 0 0 2px #eef5ec}
 .jday h3{display:flex;justify-content:space-between;align-items:baseline;font-size:.92rem;margin:0 0 6px}
 .jedit{border:0;background:none;cursor:pointer;color:#8aa096;font-size:.85rem}
 .jslot{display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-top:1px dashed #e4e7dc}
 .jmeal{flex:0 0 46px;font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4b8060;padding-top:4px}
 .jempty{border:1px dashed #b9c8bc;background:#f6f9f5;color:#607467;border-radius:9px;padding:8px 12px;cursor:pointer;font:inherit;width:100%;text-align:left}
 .jentry{flex:1;min-width:0}
 .jentry a{font-weight:700;text-decoration:none}
 .jentry a:hover{text-decoration:underline}
 .jstars{display:block;color:#b98a2f;font-size:.85rem;letter-spacing:.06em}
 .jnote{font-size:.88rem;color:#41534a;margin:5px 0;line-height:1.5}
 .jacts{display:flex;gap:8px}
 .jacts button{border:0;background:none;color:#8aa096;cursor:pointer;font-size:.78rem;padding:2px 0;text-decoration:underline}
 .jpicker{border:1px solid #cbd5ca;border-radius:16px;background:#fbfcf9;padding:16px;margin:6px 0 30px}
 .jpickhead{display:flex;gap:14px;align-items:center;flex-wrap:wrap;margin-bottom:10px}
 .jpickhead strong{font-size:1rem}
 .jsearch{display:flex;flex-direction:column;font-size:.78rem;font-weight:700;gap:4px;flex:1;min-width:180px}
 .jsearch input{padding:9px 11px;border:1px solid #cbd5ca;border-radius:9px;font:inherit}
 .jpickhead button{border:0;background:#e5ede5;color:#285a45;border-radius:9px;padding:10px 14px;cursor:pointer;font:inherit;font-weight:600}
 .jeditrow{display:flex;gap:14px;margin-bottom:10px}
 .jeditrow label{display:flex;flex-direction:column;font-size:.78rem;font-weight:700;gap:4px;flex:1}
 .jeditrow input,.jeditrow select{padding:9px 11px;border:1px solid #cbd5ca;border-radius:9px;font:inherit}
 .jlist{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:10px;max-height:340px;overflow:auto}
 .jplace{display:flex;gap:10px;align-items:center;border:1px solid #e0e5db;border-radius:12px;background:white;padding:8px 10px;cursor:pointer;font:inherit;text-align:left}
 .jplace:hover{border-color:#285a45}
 .jplace img{width:52px;height:42px;object-fit:cover;border-radius:8px;flex:none}
 .jplace span{min-width:0}
 .jplace strong{display:block;font-size:.92rem}
 .jplace small{display:block;color:#64746b;font-size:.76rem;line-height:1.4}
 .jdone{font-size:.68rem;font-weight:700;color:#745d35;background:#f2ebdc;border-radius:10px;padding:3px 7px;flex:none}
 .jbooked{border:1px solid #c9dccb;background:#eef5ec;border-radius:11px;padding:8px 9px;margin:7px 0;overflow-wrap:anywhere}
 .jbooked strong{display:block;font-size:.92rem;margin-top:3px}
 .jbooked small{display:block;color:#3e5c49;font-size:.78rem;font-weight:600;margin:2px 0}
 .jaddr{margin:3px 0 0;font-size:.78rem;color:#54685c}
 .jacts2{display:flex;gap:12px;flex-wrap:wrap;margin-top:6px;font-size:.8rem;font-weight:700}
 .jbooked .jnote{margin:6px 0 0;font-size:.74rem;line-height:1.45}
 .jtag{display:inline-block;font-size:.62rem;font-weight:800;letter-spacing:.1em;background:#285a45;color:#fff;border-radius:8px;padding:2px 7px}
 .junlock{display:flex;gap:12px;align-items:end;flex-wrap:wrap;border:1px solid #cbd5ca;background:#fbfcf9;border-radius:14px;padding:14px 16px;margin:10px 0 4px}
 .junlock span{font-size:.9rem;color:#41534a;flex:1;min-width:220px}
 .junlock label{display:flex;flex-direction:column;font-size:.78rem;font-weight:700;gap:4px}
 .junlock input{padding:10px 12px;border:1px solid #cbd5ca;border-radius:9px;font:inherit;min-width:230px}
 .junlock.jlocked{background:#eef5ec;border-color:#c9dccb;align-items:center}
 .junlock.jlocked button{border:0;background:#e5ede5;color:#285a45;border-radius:9px;padding:8px 12px;cursor:pointer;font:inherit;font-weight:600}
 .jerror{color:#a3341f;font-weight:600}
</style>
