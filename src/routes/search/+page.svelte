<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { AVAILABLE_TRANSLATIONS } from '$lib/translations.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const initialQuery = data.query;
	const initialTranslation = data.translation;
	let query = $state(initialQuery);
	let translation = $state(initialTranslation);

	const installedTranslations = $derived(
		AVAILABLE_TRANSLATIONS.filter((t) => data.installedIds.includes(t.id))
	);

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
	<h1 class="page-title">Search</h1>

	<form class="search-form" onsubmit={doSearch}>
		<div class="search-input-row">
			<input
				type="text"
				class="search-input"
				placeholder="Search the Bible..."
				bind:value={query}
				autofocus
			/>
			<button type="submit" class="btn btn-primary">Search</button>
		</div>
		{#if installedTranslations.length > 1}
			<div class="search-filters">
				<select class="search-select" bind:value={translation} onchange={() => { if (data.query) doSearch(); }}>
					{#each installedTranslations as t}
						<option value={t.id}>{t.abbreviation}</option>
					{/each}
				</select>
			</div>
		{/if}
	</form>

	{#if data.query}
		<p class="search-meta">
			{data.results.length}{data.results.length === 100 ? '+' : ''} results for &ldquo;{data.query}&rdquo;
			<span class="search-meta-translation">in {data.translation.toUpperCase()}</span>
		</p>

		{#if data.results.length === 0}
			<div class="empty-state">
				<h2>No results found</h2>
				<p>Try a different search term or translation.</p>
			</div>
		{:else}
			<div class="search-results">
				{#each data.results as result}
					<a href="/bible/{data.translation}/{result.bookSlug}/{result.chapter}" class="search-result card">
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
	{/if}
</div>
