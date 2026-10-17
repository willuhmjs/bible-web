<script lang="ts">
	import { goto } from '$app/navigation';
	import { Search, SearchX } from 'lucide-svelte';
	import { resolveTranslation, isCatholicTranslation } from '$lib/mode.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const initialQuery = data.query;
	let query = $state(initialQuery);

	const translation = $derived(resolveTranslation(data.installedIds));

	function doSearch(e?: Event) {
		e?.preventDefault();
		if (!query.trim()) return;
		goto(`/search?q=${encodeURIComponent(query.trim())}&t=${translation}`);
	}

	function highlightMatch(text: string, q: string): string {
		if (!q) return text;
		const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		return text.replace(
			new RegExp(`(${escaped})`, 'gi'),
			'<mark>$1</mark>'
		);
	}
</script>

<svelte:head>
	<title>{data.query ? `"${data.query}" - Search` : 'Search'} - Bible</title>
</svelte:head>

<div class="content">
	<h1 class="page-title">Search Scripture</h1>
	<p class="page-subtitle">Find any word or phrase across the translations you have installed.</p>

	<form class="search-form" onsubmit={doSearch} role="search">
		<label class="visually-hidden" for="bible-search">Search the Bible</label>
		<div class="search-input-row">
			<div class="search-input-wrap">
				<Search class="search-input-icon" size="19" aria-hidden="true" />
				<input
					id="bible-search"
					type="text"
					class="search-input"
					placeholder="Search the Bible&hellip;"
					bind:value={query}
					autofocus
				/>
			</div>
			<button type="submit" class="btn btn-primary" style="padding-inline: 26px;">Search</button>
		</div>
	</form>

	{#if data.query}
		<p class="search-meta">
			<strong>{data.results.length}{data.results.length === 100 ? '+' : ''}</strong>
			result{data.results.length === 1 ? '' : 's'} for &ldquo;{data.query}&rdquo;
			<span class="search-meta-translation"> &middot; in <b>{data.translation.toUpperCase()}</b></span>
		</p>

		{#if data.results.length === 0}
			<div class="empty-state">
				<span class="empty-icon"><SearchX size="26" /></span>
				<h2>No results found</h2>
				<p>Nothing matched &ldquo;{data.query}&rdquo; in this translation. Try a different spelling, term, or translation.</p>
				<a href="/translations" class="btn btn-secondary">Browse Translations</a>
			</div>
		{:else}
			<div class="search-results">
				{#each data.results as result}
					<a href="/bible/{data.translation}/{result.bookSlug}/{result.chapter}" class="search-result">
						<div class="search-result-ref">
							{result.book} {result.chapter}:{result.verse}
						</div>
						<div class="search-result-text">
							{@html highlightMatch(result.text, data.query)}
						</div>
					</a>
				{/each}
			</div>
		{/if}
	{:else if data.installedIds.length === 0}
		<div class="empty-state">
			<span class="empty-icon"><Search size="26" /></span>
			<h2>Nothing to search yet</h2>
			<p>Download a translation first and its books become searchable, instantly and offline.</p>
			<a href="/translations" class="btn btn-primary">Browse Translations</a>
		</div>
	{:else}
		<p class="search-hint">Search across your installed library &mdash; try &ldquo;faith&rdquo;, &ldquo;hesed&rdquo;, or &ldquo;in the beginning&rdquo;.</p>
	{/if}
</div>
