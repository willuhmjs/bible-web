<script lang="ts">
	import { BOOKS } from '$lib/books.js';
	import { getMode, resolveTranslation } from '$lib/mode.svelte.js';
	import { VOTD_VERSES, getTodayIndex } from '$lib/votd.js';
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

	const installedIds = $derived(
		((data as any).installedTranslations ?? []).map((t: { id: string }) => t.id)
	);
	const translation = $derived(resolveTranslation(installedIds));

	const todayIndex = getTodayIndex();
	const todayRef = VOTD_VERSES[todayIndex].ref;

	let votdText = $state<string | null>(null);
	let votdLoaded = $state(false);

	$effect(() => {
		if (!translation) return;
		votdLoaded = false;
		fetch(`/api/votd?translation=${encodeURIComponent(translation)}&day=${todayIndex}`)
			.then((r) => r.json())
			.then((d) => {
				votdText = d.text;
				votdLoaded = true;
			});
	});
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
			{#if votdText}
				<blockquote class:fade-in={votdLoaded}>&ldquo;{votdText}&rdquo;</blockquote>
			{:else if votdLoaded}
				<blockquote>&ldquo;...&rdquo;</blockquote>
			{:else}
				<blockquote class="loading">&nbsp;</blockquote>
			{/if}
			<cite>{todayRef} <span class="votd-translation">({translation.toUpperCase()})</span></cite>
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
								<svg class="deutero-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
									<g stroke="#C0A030" stroke-width="1.8">
										<ellipse cx="5.5" cy="4.5" rx="3" ry="3.5" fill="none" />
										<line x1="7.5" y1="7.2" x2="19" y2="18.7" />
										<line x1="14" y1="15" x2="16" y2="13" />
										<line x1="16.5" y1="17.5" x2="18.5" y2="15.5" />
										<line x1="19" y1="18.7" x2="20.5" y2="17.2" />
									</g>
									<g stroke="#A0A0A0" stroke-width="1.8">
										<ellipse cx="18.5" cy="4.5" rx="3" ry="3.5" fill="none" />
										<line x1="16.5" y1="7.2" x2="5" y2="18.7" />
										<line x1="10" y1="15" x2="8" y2="13" />
										<line x1="7.5" y1="17.5" x2="5.5" y2="15.5" />
										<line x1="5" y1="18.7" x2="3.5" y2="17.2" />
									</g>
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
