# Restaurant research workflow

This repository currently has **18 original selections** (15 Florence, 3 Pisa). Some venue identities are unresolved. No menu item is confirmed merely because it appears in the seed data.

## Evidence requirements

For each restaurant/dish association record the **exact Italian menu wording**, menu URL, date checked, and one of:
- `confirmed`: restaurant-owned menu or primary source names the dish
- `reported`: credible third-party menu or review names the dish
- `unverified`: research lead, not yet supported by a checked source

Do not infer a dish from the restaurant's cuisine or from a generic regional specialty. Seasonal dishes and daily specials need explicit caveats. Prefer official sources. Keep translations in `data/dishes.json`, not duplicated in restaurant entries. Display Italian names first.

## Research priority

1. Identify the four unnamed locations (Pisa Via S. Martino 86, Pisa Piazza Martiri della Libertà 29, Florence Piazza de' Cimatori, Florence Via dei Tavolini 3r), plus the gelateria at Via dei Neri 9/11R.
2. Verify all original restaurant identities, current operating status, hours and official URLs.
3. Verify exact Italian menu wording for all must-try foods, especially *cinque e cinque*, *anicini*, and seasonal specialties.
4. Research Lucca candidates (Da Giulio, Osteria Baralla, Taddeucci), add as `origin: suggested` only after validating addresses.
5. Record dietary/allergen information only where evidence supports it.

## Useful leads (not yet rechecked in this branch)

- La Casalinga official menu: https://trattorialacasalinga.it/en/our-menu/
- L'Arte di Dory published third-party menu: https://www.thefork.it/ristorante/l-arte-di-dory-r429933/menu
- Pizzeria Il Montino: https://www.pizzeriailmontino.it/
- Trattoria da Giulio: https://www.trattoriadagiulio.it/
- Osteria Baralla: https://www.osteriabaralla.it/menu/

These are leads for follow-up verification, **not evidence that specific dishes are currently available**.
