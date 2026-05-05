<script lang="ts">
	import { BOOKS } from '$lib/books.js';
	import { AVAILABLE_TRANSLATIONS } from '$lib/translations.js';
	import { getMode, getLastTranslation } from '$lib/mode.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	let selectedTestament = $state<'old' | 'new'>('old');

	const isCatholic = $derived(getMode() === 'catholic');

	const oldTestament = $derived(
		isCatholic
			? BOOKS.filter((b) => b.testament === 'old' || b.testament === 'deuterocanonical')
			: BOOKS.filter((b) => b.testament === 'old')
	);
	const newTestament = BOOKS.filter((b) => b.testament === 'new');

	const displayedBooks = $derived(
		selectedTestament === 'old' ? oldTestament : newTestament
	);

	let selectedBook = $state<string | null>(null);

	const selectedBookInfo = $derived(
		selectedBook ? BOOKS.find((b) => b.slug === selectedBook) : null
	);

	const translation = $derived.by(() => {
		const targetMode = isCatholic ? 'catholic' : 'protestant';
		const last = getLastTranslation(targetMode);
		const installed = (data as any).installedTranslations ?? [];
		const modeTranslations = installed.filter((t: { id: string }) =>
			isCatholic
				? AVAILABLE_TRANSLATIONS.find((a) => a.id === t.id)?.category === 'catholic'
				: AVAILABLE_TRANSLATIONS.find((a) => a.id === t.id)?.category !== 'catholic'
		);
		if (last && modeTranslations.some((t: { id: string }) => t.id === last)) {
			return last;
		}
		return modeTranslations[0]?.id ?? data.defaultTranslation ?? 'kjv';
	});

	const votdVerses = [
		{ text: 'For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.', ref: 'John 3:16' },
		{ text: 'The Lord is my shepherd; I shall not want.', ref: 'Psalm 23:1' },
		{ text: 'Trust in the Lord with all thine heart; and lean not unto thine own understanding.', ref: 'Proverbs 3:5' },
		{ text: 'I can do all things through Christ which strengtheneth me.', ref: 'Philippians 4:13' },
		{ text: 'And we know that all things work together for good to them that love God.', ref: 'Romans 8:28' },
		{ text: 'Be strong and of a good courage; be not afraid, neither be thou dismayed: for the Lord thy God is with thee whithersoever thou goest.', ref: 'Joshua 1:9' },
		{ text: 'The Lord is my light and my salvation; whom shall I fear?', ref: 'Psalm 27:1' }
	];

	const todayVerse = votdVerses[new Date().getDay()];
</script>

<div class="content">
	<div class="hero">
		<h1>The Bible</h1>
		<p>Read scripture with a clean, distraction-free experience.</p>
	</div>

	{#if !data.defaultTranslation}
		<div class="empty-state">
			<h2>No translations installed</h2>
			<p>Download a Bible translation to start reading.</p>
			<a href="/translations" class="btn btn-primary">Browse Translations</a>
		</div>
	{:else}
		<div class="votd">
			<blockquote>&ldquo;{todayVerse.text}&rdquo;</blockquote>
			<cite>{todayVerse.ref}</cite>
		</div>

		<div class="mb-6">
			<h2 class="section-title">Select a Book</h2>

			<div class="picker-tabs" style="max-width: 260px;">
				<button class="picker-tab" class:active={selectedTestament === 'old'} onclick={() => { selectedTestament = 'old'; selectedBook = null; }}>
					Old Testament
				</button>
				<button class="picker-tab" class:active={selectedTestament === 'new'} onclick={() => { selectedTestament = 'new'; selectedBook = null; }}>
					New Testament
				</button>
			</div>

			{#if !selectedBook}
				<div class="grid grid-3" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));">
					{#each displayedBooks as book}
						<button class="book-grid-item" onclick={() => selectedBook = book.slug}>
							{#if book.testament === 'deuterocanonical'}
								<svg class="deutero-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
									<line x1="4" y1="20" x2="20" y2="4" stroke="#C0A030" />
									<circle cx="6.5" cy="2.5" r="1.5" fill="#C0A030" />
									<path d="M3.5 21.5 L5 20 L4 19" stroke="#C0A030" fill="none" />
									<line x1="20" y1="20" x2="4" y2="4" stroke="#A0A0A0" />
									<circle cx="17.5" cy="2.5" r="1.5" fill="#A0A0A0" />
									<path d="M20.5 21.5 L19 20 L20 19" stroke="#A0A0A0" fill="none" />
								</svg>
							{/if}
							{book.name}
						</button>
					{/each}
				</div>
			{:else if selectedBookInfo}
				<div style="margin-bottom: 16px;">
					<button class="btn btn-secondary btn-sm" onclick={() => selectedBook = null}>
						&larr; Back to books
					</button>
					<span style="margin-left: 12px; font-weight: 600; font-size: 18px;">{selectedBookInfo.name}</span>
				</div>
				<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));">
					{#each Array.from({ length: selectedBookInfo.chapters }, (_, i) => i + 1) as ch}
						<a href="/bible/{translation}/{selectedBookInfo.slug}/{ch}" class="chapter-grid-item">
							{ch}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	{/if}
</div>
