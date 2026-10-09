# Menu ingestion workflow

The menu JSON is a sourced **snapshot**, not a current-price service. `data/menus.json` contains an array of restaurant menu snapshots. Each entry has a restaurant ID, source URL, source type, published date when known, retrieval date, currency, extraction method, and menu item list.

## Steps for each restaurant

1. Identify the restaurant's **official** menu page, PDF, image gallery, or download. Save the source URL. Do not assume a third-party listing is an official menu.
2. For HTML or text-layer PDFs, extract text directly. For image-only menus, perform OCR and compare each line against the original image manually. Never silently fill in illegible prices.
3. Preserve Italian menu wording exactly. Store a category, numeric price (or `null`), and a unit such as `item` or `kg`. Check whether a price is per person, per 100 g, per kilogram, or for a whole item.
4. Match `foodId` only when the listed dish really corresponds to the dictionary item. Leave it `null` for other menu entries. Do not map generic `trippa` to `trippa alla fiorentina` without further evidence.
5. Record `sourcePublishedDate` when available; otherwise use `null`. Record `retrievedAt`. Do not label old menu prices as current.
6. Run `npm run validate:data`, `npm run check`, and `npm run build`. Verify the public pages visually.

## Photos

Prefer images explicitly licensed for reuse or images provided with permission. Store `imageUrl`, `imageSourceUrl`, `imageCredit`, and a rights status. External hotlinks may fail; do not confuse a restaurant's publicity image with a freely licensed image. Never generate a picture and claim it shows an actual restaurant or its exact dish.

## Coverage

The menu search page lists only extracted entries. Missing menu items are not implied to be unavailable. Current coverage is partial, and should grow restaurant by restaurant.
