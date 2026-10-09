<script lang="ts">import '../app.css';</script>
<svelte:head><title>Tuscany Food Guide</title><meta name="description" content="An Italian-first guide to food in Florence, Pisa and Lucca." /></svelte:head>
<header><div class="shell topbar"><a class="brand" href="/">🍋 Tuscany Food Guide</a><nav aria-label="Main navigation"><a href="/">Places</a><a href="/foods">Food dictionary</a><a href="/planner">My food list</a></nav></div></header>
<main class="shell"><slot /></main>
<footer class="shell"><p>Research-backed guide · Menu availability can change · Progress is saved on this device</p></footer>
