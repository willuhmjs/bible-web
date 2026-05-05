<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { BOOKS } from '$lib/books.js';
	import { AVAILABLE_TRANSLATIONS } from '$lib/translations.js';
	import { getMode, setTranslation, resolveTranslation, isCatholicTranslation } from '$lib/mode.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	// ── Picker state ──
	let showPicker = $state(false);
	let showTranslations = $state(false);
	let pickerBook = $state<string | null>(null);

	const currentBook = $derived(BOOKS.find((b) => b.slug === data.bookSlug));
	const isCatholic = $derived(getMode() === 'catholic');

	let selectedTestament = $state<'old' | 'new'>(
		BOOKS.find((b) => b.slug === data.bookSlug)?.testament === 'new' ? 'new' : 'old'
	);

	const oldTestament = $derived(
		isCatholic
			? BOOKS.filter((b) => b.testament === 'old' || b.testament === 'deuterocanonical')
			: BOOKS.filter((b) => b.testament === 'old')
	);
	const newTestament = BOOKS.filter((b) => b.testament === 'new');
	const displayedBooks = $derived(
		selectedTestament === 'old' ? oldTestament : newTestament
	);
	const pickerBookInfo = $derived(
		pickerBook ? BOOKS.find((b) => b.slug === pickerBook) : null
	);

	function navigateToChapter(bookSlug: string, chapter: number) {
		showPicker = false;
		pickerBook = null;
		goto(`/bible/${data.translation}/${bookSlug}/${chapter}`);
	}

	function switchTranslation(id: string) {
		showTranslations = false;
		setTranslation(id);
		goto(`/bible/${id}/${data.bookSlug}/${data.chapter}`);
	}

	const parentData = $derived(page.data as { installedTranslations: Array<{ id: string; abbreviation: string; name: string }> });

	const filteredTranslations = $derived(
		parentData.installedTranslations.filter((t) =>
			isCatholic
				? isCatholicTranslation(t.id)
				: !isCatholicTranslation(t.id)
		)
	);

	$effect(() => {
		const currentIsCatholic = isCatholicTranslation(data.translation);
		if (isCatholic === currentIsCatholic) {
			setTranslation(data.translation);
			return;
		}
		const installedIds = parentData.installedTranslations.map(t => t.id);
		const target = resolveTranslation(installedIds);
		if (target) {
			const isDeutero = currentBook?.testament === 'deuterocanonical';
			if (!isCatholic && isDeutero) {
				goto(`/bible/${target}/genesis/1`);
			} else {
				goto(`/bible/${target}/${data.bookSlug}/${data.chapter}`);
			}
		}
	});

	// ── Verse selection ──
	let selectedVerses = $state<Set<string>>(new Set());
	let lastClickedVerse = $state<string | null>(null);
	let showCopied = $state(false);

	function toggleVerse(verseNum: string, event: MouseEvent) {
		const next = new Set(selectedVerses);

		if (event.shiftKey && lastClickedVerse) {
			const start = parseInt(lastClickedVerse);
			const end = parseInt(verseNum);
			const lo = Math.min(start, end);
			const hi = Math.max(start, end);
			for (let i = lo; i <= hi; i++) {
				next.add(String(i));
			}
		} else {
			if (next.has(verseNum)) {
				next.delete(verseNum);
			} else {
				next.add(verseNum);
			}
		}

		selectedVerses = next;
		lastClickedVerse = verseNum;
	}

	function clearSelection() {
		selectedVerses = new Set();
	}

	const selectedRef = $derived(() => {
		if (selectedVerses.size === 0) return '';
		const nums = [...selectedVerses].map(Number).sort((a, b) => a - b);
		if (nums.length === 1) return `${data.bookName} ${data.chapter}:${nums[0]}`;
		return `${data.bookName} ${data.chapter}:${nums[0]}-${nums[nums.length - 1]}`;
	});

	async function copyVerses() {
		const sorted = [...selectedVerses].map(Number).sort((a, b) => a - b);
		const texts = sorted
			.map((n) => data.verses.find((v) => v.verse === String(n))?.text)
			.filter(Boolean);
		const formatted = `"${texts.join(' ')}" — ${selectedRef()} (${data.translation.toUpperCase()})`;
		await navigator.clipboard.writeText(formatted);
		showCopied = true;
		setTimeout(() => showCopied = false, 2000);
	}

	// ── Reader settings ──
	let showSettings = $state(false);
	let fontSize = $state(20);
	let fontFamily = $state<'serif' | 'sans' | 'mono'>('serif');
	let lineSpacing = $state<'compact' | 'normal' | 'relaxed'>('normal');

	const fontFamilyMap = {
		serif: 'var(--font-serif)',
		sans: 'var(--font-sans)',
		mono: 'ui-monospace, "Cascadia Code", "Source Code Pro", Menlo, monospace'
	};

	const lineHeightMap = { compact: '1.5', normal: '1.9', relaxed: '2.2' };

	if (browser) {
		const saved = localStorage.getItem('bible-reader-settings');
		if (saved) {
			try {
				const s = JSON.parse(saved);
				if (s.fontSize) fontSize = s.fontSize;
				if (s.fontFamily) fontFamily = s.fontFamily;
				if (s.lineSpacing) lineSpacing = s.lineSpacing;
			} catch {}
		}
	}

	function saveSettings() {
		if (browser) {
			localStorage.setItem('bible-reader-settings', JSON.stringify({ fontSize, fontFamily, lineSpacing }));
		}
	}

	$effect(() => {
		fontSize; fontFamily; lineSpacing;
		saveSettings();
	});

	// ── Keyboard navigation ──
	function handleKeydown(e: KeyboardEvent) {
		if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

		if (e.key === 'ArrowLeft' && data.prevLink) {
			goto(data.prevLink);
		} else if (e.key === 'ArrowRight' && data.nextLink) {
			goto(data.nextLink);
		} else if (e.key === 'Escape') {
			if (showPicker) { showPicker = false; pickerBook = null; }
			else if (showTranslations) showTranslations = false;
			else if (showSettings) showSettings = false;
			else if (selectedVerses.size > 0) clearSelection();
		}
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{data.bookName} {data.chapter} - Bible</title>
</svelte:head>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="content" onclick={(e) => {
	if (!(e.target as HTMLElement).closest('.verse-wrapper') && !(e.target as HTMLElement).closest('.verse-actions')) {
		clearSelection();
	}
}}>
	<div class="chapter-header">
		<div style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 8px; flex-wrap: wrap;">
			<button class="btn btn-secondary btn-sm" onclick={() => { showPicker = true; pickerBook = null; }}>
				{data.bookName} {data.chapter} &#9662;
			</button>

			<div class="translation-selector">
				<button class="translation-selector-btn" onclick={() => showTranslations = !showTranslations}>
					{data.translation.toUpperCase()} &#9662;
				</button>
				{#if showTranslations}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div style="position: fixed; inset: 0; z-index: 199;" onclick={() => showTranslations = false}></div>
					<div class="translation-dropdown">
						{#each filteredTranslations as t}
							<button
								class="translation-dropdown-item"
								class:active={t.id === data.translation}
								onclick={() => switchTranslation(t.id)}
							>
								<strong>{t.abbreviation}</strong> &mdash; {t.name}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<a href="/bible/{data.translation}/{data.bookSlug}/{data.chapter}/parallel" class="btn btn-secondary btn-sm">
				Parallel
			</a>

			<div style="position: relative;">
				<button class="btn btn-secondary btn-sm" onclick={() => showSettings = !showSettings} aria-label="Reader settings">
					Aa
				</button>
				{#if showSettings}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div style="position: fixed; inset: 0; z-index: 199;" onclick={() => showSettings = false}></div>
					<div class="settings-panel">
						<div class="settings-group">
							<div style="display: flex; justify-content: space-between; align-items: center;">
								<div class="settings-label">Font Size</div>
								<div class="settings-value">{fontSize}px</div>
							</div>
							<input type="range" class="settings-slider" min="14" max="32" bind:value={fontSize} />
						</div>
						<div class="settings-group">
							<div class="settings-label">Font</div>
							<div class="settings-options">
								<button class="settings-option" class:active={fontFamily === 'serif'} onclick={() => fontFamily = 'serif'}>Serif</button>
								<button class="settings-option" class:active={fontFamily === 'sans'} onclick={() => fontFamily = 'sans'}>Sans</button>
								<button class="settings-option" class:active={fontFamily === 'mono'} onclick={() => fontFamily = 'mono'}>Mono</button>
							</div>
						</div>
						<div class="settings-group">
							<div class="settings-label">Line Spacing</div>
							<div class="settings-options">
								<button class="settings-option" class:active={lineSpacing === 'compact'} onclick={() => lineSpacing = 'compact'}>Compact</button>
								<button class="settings-option" class:active={lineSpacing === 'normal'} onclick={() => lineSpacing = 'normal'}>Normal</button>
								<button class="settings-option" class:active={lineSpacing === 'relaxed'} onclick={() => lineSpacing = 'relaxed'}>Relaxed</button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

	<h1 class="chapter-title">{data.bookName} {data.chapter}</h1>

	<div
		class="scripture"
		style="font-size: {fontSize}px; font-family: {fontFamilyMap[fontFamily]}; line-height: {lineHeightMap[lineSpacing]};"
	>
		{#each data.verses as verse}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<span
				class="verse-wrapper"
				class:selected={selectedVerses.has(verse.verse)}
				onclick={(e) => toggleVerse(verse.verse, e)}
			><span class="verse-num">{verse.verse}</span><span class="verse-text">{verse.text} </span></span>
		{/each}
	</div>

	<div class="chapter-nav">
		{#if data.prevLink}
			<a href={data.prevLink} class="chapter-nav-btn">&larr; Previous</a>
		{:else}
			<span></span>
		{/if}
		{#if data.nextLink}
			<a href={data.nextLink} class="chapter-nav-btn">Next &rarr;</a>
		{:else}
			<span></span>
		{/if}
	</div>
</div>

{#if selectedVerses.size > 0}
	<div class="verse-actions">
		<span class="ref">{selectedRef()}</span>
		<span class="divider"></span>
		<button onclick={copyVerses}>Copy</button>
	</div>
{/if}

{#if showCopied}
	<div class="copied-toast">Copied to clipboard</div>
{/if}

{#if showPicker}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="picker-overlay" onclick={() => { showPicker = false; pickerBook = null; }}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="picker-modal" onclick={(e) => e.stopPropagation()}>
			{#if !pickerBook}
				<h2>Select a Book</h2>
				<div class="picker-tabs">
					<button class="picker-tab" class:active={selectedTestament === 'old'} onclick={() => selectedTestament = 'old'}>
						Old Testament
					</button>
					<button class="picker-tab" class:active={selectedTestament === 'new'} onclick={() => selectedTestament = 'new'}>
						New Testament
					</button>
				</div>
				<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));">
					{#each displayedBooks as book}
						<button
							class="book-grid-item"
							class:active={book.slug === data.bookSlug}
							onclick={() => pickerBook = book.slug}
						>
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
			{:else if pickerBookInfo}
				<div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
					<button class="btn btn-secondary btn-sm" onclick={() => pickerBook = null}>&larr;</button>
					<h2 style="margin: 0;">{pickerBookInfo.name}</h2>
				</div>
				<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));">
					{#each Array.from({ length: pickerBookInfo.chapters }, (_, i) => i + 1) as ch}
						<button
							class="chapter-grid-item"
							class:active={pickerBookInfo.slug === data.bookSlug && ch === data.chapter}
							onclick={() => navigateToChapter(pickerBookInfo!.slug, ch)}
						>
							{ch}
						</button>
					{/each}
				</div>
			{/if}
		</div>
	</div>
{/if}
