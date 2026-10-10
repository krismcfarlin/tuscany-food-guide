# Where-to-eat sourcing for previously unsourced dishes — 2026-10-10

Closes the "where to eat: still researching" gap on six of seven foods from the
foods dictionary. All sources checked 2026-10-10. New venues are `origin:
suggested` per repo convention.

## New suggested venues

| Venue | City | Why added | Identity source |
|---|---|---|---|
| Osteria I Santi (Via Santa Maria 71) | Pisa | Official menu names Bordatino ("Solo in stagione") and Torta co' bischeri | https://www.osteria-isanti.com/it/menu |
| Antico Forno Giglio (Via Gioberti 151r) | Florence | Named in firenzemadeintuscany "10 places for the best schiacciata con l'uva" | https://www.firenzemadeintuscany.com/en/article/la-schiacciata-con-luva-10-places-find-best-florence/ |
| Ino - Panino e Gastronomia (Via dei Georgofili 3r/7r) | Florence | Official site has a dedicated Schiacciata con l'uva page | https://www.inofirenze.com/schiacciata-con-luva/ |
| Forno Becagli (Borgo Ognissanti 92/r) | Florence | 2023 winner of the "miglior schiacciata con l'uva di Firenze" contest | https://www.cibotoday.it/citta/firenze/miglior-schiacciata-uva-firenze.html |

## Dish links added or upgraded

- **bordatino** → Osteria I Santi: confirmed (official site menu). Seasonal caveat stored.
- **torta-co-bischeri** → Osteria I Santi: confirmed (official site menu, dessert list).
- **baccala-coi-porri** → Trattoria da Giulio: confirmed from the stored May-2025
  official PDF menu ("Baccalà con porri" €14). The menu snapshot already carried
  `foodId` mappings; the evidence row was missing until now.
- **cioncia** → Trattoria da Giulio: confirmed (same PDF, €12). Trattoria Lucchese
  link upgraded to confirmed via its March-2026 PDF menu ("Cioncia (antica ricetta
  toscana)" €10).
- **zuppa-frantoiana** → Trattoria Lucchese: confirmed (official PDF, "Zuppa
  frantoiana" €9). Gigi Trattoria reported link kept as-is.
- **torta-coi-becchi** → Buccellato Taddeucci: confirmed via official product page
  "Torta Coi Becchi alle Mandorle" (https://www.buccellatotaddeucci.it/prodotti-dettaglio.php?id=41).
  This resolves the long-standing "find a place for torta coi becchi" gap.
- **castagnaccio** + **cecina** → Pizzeria Il Montino: upgraded unverified →
  confirmed; official site text names both among specialties ("le famose pizze, la
  cecina, il castagnaccio e le schiacciate farcite"). Seasonal check advised.
- **schiacciata-con-luva** → Ino (confirmed, official page), Antico Forno Giglio
  (reported), Forno Becagli (reported, 2023 contest winner). September–October
  only; trip window (late Oct) is borderline — recheck closer to travel.

## Negative result: anicini

Multiple searches found no Pisa/Lucca/Florence venue verifiably selling anicini.
Wikipedia (it.wikipedia.org/wiki/Anicini) places the origin in **Liguria/Sardinia**,
not Tuscany; "anicini" shop listings found online are Amalfi/Genoa producers
(Gambardella = Minori, Camogli = Genova). The earlier research-gaps item
"Find anicini biscuits separately from anise-flavored buccellato" stands
**unresolved by design**: the honest answer may be that this is not a Tuscan
dish and no trip location should be claimed. Recorded in `data/dishes.json`
notes for anicini.

## Removed from consideration

- **Pasticceria Salza (Borgo Stretto 46, Pisa)** — widely recommended online for
  torta co' bischeri, but Il Tirreno / La Nazione (May 2026) report it **closed in
  2025**; a breakfast chain takes the space. Do not add.

## Still open

- Seasonal availability for bordatino, schiacciata con l'uva, castagnaccio,
  zuppa frantoiana at the trip dates.
- Anicini (see negative result above; consider reframing the dictionary entry).
- Panimo photo shows the Via Cavalca 68 branch (noted in restaurant record).
