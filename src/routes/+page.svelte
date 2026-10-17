<script lang="ts">
	import { BookOpen, BookOpenText, ChevronRight, Columns2, Library, Search, ShieldCheck } from 'lucide-svelte';
	import { BOOKS } from '$lib/books.js';
	import { AVAILABLE_TRANSLATIONS } from '$lib/translations.js';
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

	const installed = $derived((data as any).installedTranslations ?? []);
	const installedIds = $derived(installed.map((t: { id: string }) => t.id));
	const translation = $derived(resolveTranslation(installedIds));

	const langCount = new Set(AVAILABLE_TRANSLATIONS.map((t) => t.language)).size;

	const todayIndex = getTodayIndex();
	const today = VOTD_VERSES[todayIndex];

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
			})
			.catch(() => {
				votdLoaded = true;
			});
	});
</script>

<svelte:head>
	<title>Bible — Read Scripture Beautifully</title>
</svelte:head>

<div class="hero">
	<div class="hero-inner">
		<span class="eyebrow"><Library size="14" aria-hidden="true" /> {AVAILABLE_TRANSLATIONS.length} translations, stored locally</span>
		<h1>The Holy Bible,<br />beautifully <em>readable</em>.</h1>
		<p class="hero-tagline">
			A calm, fast, private home for Scripture — classic public-domain translations set in fine
			typography, with search, side-by-side comparison, and notes that stay on your own server.
		</p>
		{#if data.defaultTranslation}
			<div class="hero-actions">
				<a href="/bible/{translation}/genesis/1" class="btn btn-primary btn-lg">
					<BookOpenText size="19" /> Start Reading
				</a>
				<a href="/translations" class="btn btn-secondary btn-lg">Browse Translations</a>
			</div>
		{:else}
			<div class="hero-actions">
				<a href="/translations" class="btn btn-primary btn-lg">
					<Library size="19" /> Download Your First Translation
				</a>
			</div>
		{/if}
		<div class="hero-stats" aria-label="Library at a glance">
			<div class="hero-stat"><div class="num">{AVAILABLE_TRANSLATIONS.length}</div><div class="lbl">Translations</div></div>
			<div class="hero-stat"><div class="num">{langCount}</div><div class="lbl">Languages</div></div>
			<div class="hero-stat"><div class="num">66</div><div class="lbl">Books</div></div>
			<div class="hero-stat"><div class="num">31,102</div><div class="lbl">Verses</div></div>
		</div>
	</div>
</div>

<div class="content" style="padding-top: 0;">
	{#if !data.defaultTranslation}
		<div class="empty-state">
			<span class="empty-icon"><Library size="28" /></span>
			<h2>No translations installed yet</h2>
			<p>Download a Bible translation to start reading. They are stored on your own server — once each, forever.</p>
			<a href="/translations" class="btn btn-primary btn-lg">Browse Translations</a>
		</div>
	{:else}
		<div class="votd" aria-label="Verse of the day">
			<span class="votd-label">Verse of the Day</span>
			{#if votdText}
				<blockquote class="fade-in">&ldquo;{votdText}&rdquo;</blockquote>
			{:else if votdLoaded}
				<blockquote>&ldquo;This passage is not available in the selected translation.&rdquo;</blockquote>
			{:else}
				<blockquote class="skeleton" aria-hidden="true">
					<span class="skeleton-line" style="display:block; height:26px; width:92%; margin:0 auto 14px;"></span>
					<span class="skeleton-line" style="display:block; height:26px; width:78%; margin:0 auto 14px;"></span>
					<span class="skeleton-line" style="display:block; height:26px; width:46%; margin:0 auto;"></span>
				</blockquote>
			{/if}
			<cite>
				<a href="/bible/{translation}/{today.bookSlug}/{today.chapter}" style="color: inherit;">
					{today.ref} <span class="votd-translation">({translation.toUpperCase()})</span>
				</a>
			</cite>
		</div>

		<section class="home-section" style="padding-top: 64px;" aria-label="Features">
			<div class="features">
				<div class="feature-card">
					<span class="feature-icon"><Columns2 size="22" /></span>
					<h3>Read in parallel</h3>
					<p>Set any two translations side by side — Tyndale against the WEB, or English beside German — verse for verse.</p>
				</div>
				<div class="feature-card">
					<span class="feature-icon"><Search size="22" /></span>
					<h3>Find any verse</h3>
					<p>Instant full-text search across every book you have installed, with the words you sought marked in place.</p>
				</div>
				<div class="feature-card">
					<span class="feature-icon"><ShieldCheck size="22" /></span>
					<h3>Private by design</h3>
					<p>No accounts required to read, no trackers, nothing sent to third parties. Your library lives on your own server.</p>
				</div>
			</div>
		</section>

		<section class="home-section" style="padding-top: 64px;" aria-label="Choose a book to read">
			<h2 class="section-title">Choose a Book</h2>

			<div class="picker-tabs" style="max-width: 280px;">
				<button
					class="picker-tab"
					class:active={selectedTestament === 'old'}
					onclick={() => { selectedTestament = 'old'; selectedBook = null; }}
					aria-pressed={selectedTestament === 'old'}
				>
					Old Testament
				</button>
				<button
					class="picker-tab"
					class:active={selectedTestament === 'new'}
					onclick={() => { selectedTestament = 'new'; selectedBook = null; }}
					aria-pressed={selectedTestament === 'new'}
				>
					New Testament
				</button>
			</div>

			{#if !selectedBook}
				<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));">
					{#each displayedBooks as book}
						<button class="book-grid-item" onclick={() => selectedBook = book.slug}>
							{#if book.testament === 'deuterocanonical'}
								<svg class="deutero-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round" aria-label="Deuterocanonical book">
									<g stroke="#C0A030" stroke-width="1.8">
										<ellipse cx="5.5" cy="19.5" rx="3" ry="3.5" fill="none" />
										<line x1="7.5" y1="16.8" x2="19" y2="5.3" />
										<line x1="10" y1="9" x2="8" y2="11" />
										<line x1="7.5" y1="6.5" x2="5.5" y2="8.5" />
										<line x1="19" y1="5.3" x2="20.5" y2="6.8" />
									</g>
									<g stroke="#A0A0A0" stroke-width="1.8">
										<ellipse cx="18.5" cy="19.5" rx="3" ry="3.5" fill="none" />
										<line x1="16.5" y1="16.8" x2="5" y2="5.3" />
										<line x1="14" y1="9" x2="16" y2="11" />
										<line x1="16.5" y1="6.5" x2="18.5" y2="8.5" />
										<line x1="5" y1="5.3" x2="3.5" y2="6.8" />
									</g>
								</svg>
							{/if}
							{book.name}
						</button>
					{/each}
				</div>
			{:else if selectedBookInfo}
				<div style="display: flex; align-items: center; gap: 14px; margin-bottom: 18px; flex-wrap: wrap;">
					<button class="btn btn-secondary btn-sm" onclick={() => selectedBook = null}>
						&larr; Back to books
					</button>
					<span style="font-family: var(--font-serif); font-weight: 600; font-size: 22px;">{selectedBookInfo.name}</span>
					<span style="color: var(--color-text-muted); font-size: 13px;">{selectedBookInfo.chapters} chapters</span>
				</div>
				<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));">
					{#each Array.from({ length: selectedBookInfo.chapters }, (_, i) => i + 1) as ch}
						<a href="/bible/{translation}/{selectedBookInfo.slug}/{ch}" class="chapter-grid-item">
							{ch}
						</a>
					{/each}
				</div>
			{/if}
		</section>

		<section class="home-section" style="padding-top: 64px;" aria-label="Your installed translations">
			<h2 class="section-title">In Your Library</h2>
			<div class="trans-chips">
				{#each installed.slice(0, 8) as t}
					<a href="/bible/{t.id}/genesis/1" class="trans-chip">
						<span class="abbr">{t.abbreviation}</span>
						<span class="meta">
							<span class="name">{t.name}</span>
							<span class="lang">{t.language}</span>
						</span>
					</a>
				{/each}
			</div>
			<p style="margin-top: 18px;">
				<a href="/translations" class="btn btn-secondary btn-sm">
					<Library size="15" /> {installed.length < AVAILABLE_TRANSLATIONS.length
						? `Browse all ${AVAILABLE_TRANSLATIONS.length} translations`
						: 'Manage translations'} <ChevronRight size="15" />
				</a>
			</p>
		</section>
	{/if}
</div>
