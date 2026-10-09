# Development

Requires Node 22+. Run `npm install`, then `npm run dev` for local preview. Run `npm run test` before merging.

This is a static SvelteKit site: `npm run build` outputs `build/`. It can be hosted publicly even while the source repository stays private. Deployment is **not configured** yet.

Progress is stored in localStorage on the current browser/device; it does not sync across devices. Content works after page load, but offline caching and maps are future work. Google Maps links open externally and require connectivity.

Evidence display: confirmed (restaurant-owned/primary), reported (third party), unverified (hidden from place cards). Do not imply that a published menu guarantees today's availability.
