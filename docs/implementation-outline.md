# Implementation outline (research-first)

Target: mobile-first SvelteKit + TypeScript PWA, static hosting, no account or backend, IndexedDB progress, online MapLibre tiles and external navigation.

## Data contracts

- `restaurants.json`: stable ID, city, address, origin (`original`/`suggested`), identity verification, coordinates once sourced.
- `dishes.json`: canonical Italian name, English description, regional names, menu aliases, ingredients when sourced.
- `restaurant-dishes.json`: join table; exact Italian menu text, evidence status, source URL, observed date, seasonality.

## UI

- Italian-first restaurant dish labels linking to `/foods/[slug]`.
- `/foods` searchable bilingual dictionary; dish page explains variants and lists venues by evidence tier.
- User's original picks prioritized on maps and lists.
- City/food coverage planner, visited/tasted checklists, offline-readable data.
- Never promote unverified candidates as menu-confirmed items.

## Build order

1. Complete research dataset and validation schema.
2. SvelteKit shell, city and restaurant pages.
3. Dictionary and menu-evidence links.
4. Maps and route planning.
5. Offline cache, progress, tests, deployment.

All changes should be reviewed in pull requests. Avoid per-city one-off components and duplicated dish translations.
