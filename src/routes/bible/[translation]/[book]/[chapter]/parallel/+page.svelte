<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	function switchCompare(id: string) {
		goto(`/bible/${data.translation}/${data.bookSlug}/${data.chapter}/parallel?compare=${id}`);
	}
</script>

<svelte:head>
	<title>{data.bookName} {data.chapter} - Parallel - Bible</title>
</svelte:head>

<div class="parallel-container" style="padding-bottom: 0;">
	<div style="grid-column: 1 / -1; display: flex; align-items: center; gap: 12px; margin-bottom: 0; flex-wrap: wrap;">
		<a href={data.backLink} class="btn btn-secondary btn-sm">&larr; Back</a>
		<span style="font-size: 18px; font-weight: 600;">{data.bookName} {data.chapter}</span>
		{#if data.availableTranslations.length > 2}
			<select
				class="search-select"
				style="margin-top: 0;"
				value={data.secondTranslation}
				onchange={(e) => switchCompare((e.target as HTMLSelectElement).value)}
			>
				{#each data.availableTranslations.filter(t => t.id !== data.translation) as t}
					<option value={t.id}>{t.abbreviation} - {t.name}</option>
				{/each}
			</select>
		{/if}
	</div>
</div>

<div class="parallel-container">
	<div class="parallel-column">
		<h2>{data.translation.toUpperCase()}</h2>
		{#each data.primaryVerses as verse}
			<div class="parallel-verse scripture" style="font-size: 16px; line-height: 1.7;">
				<span class="verse-num">{verse.verse}</span>
				<span class="verse-text">{verse.text}</span>
			</div>
		{/each}
	</div>

	<div class="parallel-column">
		<h2>{data.secondTranslation.toUpperCase()}</h2>
		{#if data.secondaryVerses.length > 0}
			{#each data.secondaryVerses as verse}
				<div class="parallel-verse scripture" style="font-size: 16px; line-height: 1.7;">
					<span class="verse-num">{verse.verse}</span>
					<span class="verse-text">{verse.text}</span>
				</div>
			{/each}
		{:else}
			<div class="empty-state">
				<p>Install another translation to compare.</p>
				<a href="/translations" class="btn btn-primary btn-sm">Browse Translations</a>
			</div>
		{/if}
	</div>
</div>
