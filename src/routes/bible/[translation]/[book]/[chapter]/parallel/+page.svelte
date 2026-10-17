<script lang="ts">
	import { goto } from '$app/navigation';
	import { ArrowLeft, Columns2 } from 'lucide-svelte';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	function switchCompare(id: string) {
		goto(`/bible/${data.translation}/${data.bookSlug}/${data.chapter}/parallel?compare=${id}`);
	}

	const firstMeta = $derived(data.availableTranslations.find((t) => t.id === data.translation));
	const secondMeta = $derived(data.availableTranslations.find((t) => t.id === data.secondTranslation));
</script>

<svelte:head>
	<title>{data.bookName} {data.chapter} - Parallel - Bible</title>
</svelte:head>

<div class="parallel-container">
	<div class="parallel-topbar">
		<a href={data.backLink} class="btn btn-secondary btn-sm"><ArrowLeft size="15" /> Back to reader</a>
		<span class="pt-title">{data.bookName} {data.chapter}</span>
		{#if data.availableTranslations.length > 2}
			<label class="visually-hidden" for="compare-select">Compare with</label>
			<select
				id="compare-select"
				class="search-select"
				style="margin-top: 0; width: auto;"
				value={data.secondTranslation}
				onchange={(e) => switchCompare((e.target as HTMLSelectElement).value)}
			>
				{#each data.availableTranslations.filter(t => t.id !== data.translation) as t}
					<option value={t.id}>{t.abbreviation} &mdash; {t.name}</option>
				{/each}
			</select>
		{/if}
	</div>

	<div class="parallel-column">
		<h2>
			<span class="pt-badge">{data.translation.toUpperCase()}</span>
			{#if firstMeta}{firstMeta.name}{/if}
		</h2>
		{#each data.primaryVerses as verse}
			<div class="parallel-verse scripture" style="font-size: 16.5px; line-height: 1.75;">
				<span class="verse-num">{verse.verse}</span>
				<span class="verse-text">{verse.text} </span>
			</div>
		{/each}
	</div>

	<div class="parallel-column">
		<h2>
			<span class="pt-badge">{data.secondTranslation ? data.secondTranslation.toUpperCase() : '—'}</span>
			{#if secondMeta}{secondMeta.name}{/if}
		</h2>
		{#if data.secondaryVerses.length > 0}
			{#each data.secondaryVerses as verse}
				<div class="parallel-verse scripture" style="font-size: 16.5px; line-height: 1.75;">
					<span class="verse-num">{verse.verse}</span>
					<span class="verse-text">{verse.text} </span>
				</div>
			{/each}
		{:else}
			<div class="empty-state" style="padding: 48px 20px;">
				<span class="empty-icon"><Columns2 size="24" /></span>
				<h3 style="font-family: var(--font-serif); font-size: 21px; margin-bottom: 8px;">Nothing to compare yet</h3>
				<p style="font-size: 14px;">Install a second translation and it will appear here, verse for verse.</p>
				<a href="/translations" class="btn btn-primary btn-sm">Browse Translations</a>
			</div>
		{/if}
	</div>
</div>
