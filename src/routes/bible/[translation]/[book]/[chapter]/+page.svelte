<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import {
		BookOpen,
		ChevronDown,
		ChevronLeft,
		ChevronRight,
		Copy,
		Columns2,
		MessageSquareText,
		Settings2,
		Trash2,
		X
	} from 'lucide-svelte';
	import { BOOKS } from '$lib/books.js';
	import { getMode, setTranslation, resolveTranslation, isCatholicTranslation } from '$lib/mode.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const parentData = $derived(page.data as { installedTranslations: Array<{ id: string; abbreviation: string; name: string }>; session: { user?: { id?: string } } | null });
	const session = $derived(parentData.session);

	// ── Picker state ──
	let showPicker = $state(false);
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

	const installedIds = $derived(
		parentData.installedTranslations.map(t => t.id)
	);

	$effect(() => {
		const currentIsCatholic = isCatholicTranslation(data.translation);
		if (isCatholic === currentIsCatholic) {
			setTranslation(data.translation);
			return;
		}
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

	function toggleVerseKeyboard(verseNum: string, event: KeyboardEvent) {
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		toggleVerse(verseNum, { shiftKey: event.shiftKey } as MouseEvent);
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

	// ── Marks state ──
	const HIGHLIGHT_COLORS = ['#FFD700', '#90EE90', '#87CEEB', '#FFB6C1', '#DDA0DD'];

	let marks = $state<Map<number, { color: string; comment: string | null }>>(new Map());

	$effect(() => {
		const m = new Map<number, { color: string; comment: string | null }>();
		for (const mark of data.marks) {
			m.set(mark.verse, { color: mark.color, comment: mark.comment });
		}
		marks = m;
	});

	let commentingVerse = $state<number | null>(null);
	let commentText = $state('');
	let savingMark = $state(false);

	async function highlightVerses(color: string) {
		if (!session?.user?.id || savingMark) return;
		savingMark = true;

		const sorted = [...selectedVerses].map(Number).sort((a, b) => a - b);
		for (const v of sorted) {
			const existing = marks.get(v);
			if (existing?.color === color) {
				await fetch('/api/marks', {
					method: 'DELETE',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ book: data.bookSlug, chapter: data.chapter, verse: v })
				});
				marks.delete(v);
			} else {
				await fetch('/api/marks', {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ book: data.bookSlug, chapter: data.chapter, verse: v, color })
				});
				marks.set(v, { color, comment: existing?.comment ?? null });
			}
		}
		marks = new Map(marks);
		savingMark = false;
		clearSelection();
	}

	function startComment(verseNum: number) {
		commentingVerse = verseNum;
		commentText = marks.get(verseNum)?.comment ?? '';
		clearSelection();
	}

	async function saveComment() {
		if (!session?.user?.id || commentingVerse == null) return;
		savingMark = true;

		const existing = marks.get(commentingVerse);
		await fetch('/api/marks', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				book: data.bookSlug,
				chapter: data.chapter,
				verse: commentingVerse,
				color: existing?.color ?? '#FFD700',
				comment: commentText || null
			})
		});
		marks.set(commentingVerse, { color: existing?.color ?? '#FFD700', comment: commentText || null });
		marks = new Map(marks);
		commentingVerse = null;
		commentText = '';
		savingMark = false;
	}

	async function deleteComment(verseNum: number) {
		if (!session?.user?.id) return;
		const existing = marks.get(verseNum);
		if (!existing) return;

		await fetch('/api/marks', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				book: data.bookSlug,
				chapter: data.chapter,
				verse: verseNum,
				color: existing.color,
				comment: null
			})
		});
		marks.set(verseNum, { color: existing.color, comment: null });
		marks = new Map(marks);
	}

	async function removeHighlights() {
		if (!session?.user?.id || savingMark) return;
		savingMark = true;

		const sorted = [...selectedVerses].map(Number).sort((a, b) => a - b);
		for (const v of sorted) {
			if (!marks.has(v)) continue;
			await fetch('/api/marks', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ book: data.bookSlug, chapter: data.chapter, verse: v })
			});
			marks.delete(v);
		}
		marks = new Map(marks);
		savingMark = false;
		clearSelection();
	}

	const selectionHasMarks = $derived(() => {
		return [...selectedVerses].some(v => marks.has(parseInt(v)));
	});

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

	const lineHeightMap = { compact: '1.5', normal: '1.85', relaxed: '2.15' };

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
			if (commentingVerse != null) commentingVerse = null;
			else if (showPicker) { showPicker = false; pickerBook = null; }
			else if (showSettings) showSettings = false;
			else if (selectedVerses.size > 0) clearSelection();
		}
	}

	const abbr = $derived(data.translation.toUpperCase());
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{data.bookName} {data.chapter} ({abbr}) - Bible</title>
</svelte:head>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="content" onclick={(e) => {
	if (!(e.target as HTMLElement).closest('.verse-wrapper') && !(e.target as HTMLElement).closest('.verse-actions') && !(e.target as HTMLElement).closest('.comment-input-area')) {
		clearSelection();
	}
}}>
	<div class="chapter-header">
		<div class="reader-controls">
			<button class="btn btn-secondary btn-sm" onclick={() => { showPicker = true; pickerBook = null; }} aria-label="Change book or chapter">
				<BookOpen size="15" />
				{data.bookName} {data.chapter}
				<ChevronDown size="14" />
			</button>

			<a href="/bible/{data.translation}/{data.bookSlug}/{data.chapter}/parallel" class="btn btn-secondary btn-sm">
				<Columns2 size="15" /> Parallel
			</a>

			<div style="position: relative;">
				<button
					class="btn btn-secondary btn-sm"
					onclick={() => showSettings = !showSettings}
					onkeydown={(e) => { if (e.key === 'Escape') showSettings = false; }}
					aria-label="Reader settings"
					aria-expanded={showSettings}
					aria-haspopup="dialog"
				>
					<Settings2 size="15" /> Text
				</button>
				{#if showSettings}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div style="position: fixed; inset: 0; z-index: 199;" onclick={() => showSettings = false}></div>
					<div class="settings-panel" role="dialog" aria-label="Reader settings">
						<div class="settings-group">
							<div style="display: flex; justify-content: space-between; align-items: center;">
								<div class="settings-label" style="margin-bottom: 0;">Text Size</div>
								<div class="settings-value">{fontSize}px</div>
							</div>
							<div style="height: 10px;"></div>
							<input
								type="range"
								class="settings-slider"
								min="14"
								max="32"
								bind:value={fontSize}
								aria-label="Text size"
							/>
						</div>
						<div class="settings-group">
							<div class="settings-label">Typeface</div>
							<div class="settings-options">
								<button class="settings-option font-opt-serif" class:active={fontFamily === 'serif'} onclick={() => fontFamily = 'serif'}>Serif</button>
								<button class="settings-option font-opt-sans" class:active={fontFamily === 'sans'} onclick={() => fontFamily = 'sans'}>Sans</button>
								<button class="settings-option font-opt-mono" class:active={fontFamily === 'mono'} onclick={() => fontFamily = 'mono'}>Mono</button>
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
	<div class="chapter-ornament" aria-hidden="true"><span class="diamond"></span></div>

	<div
		class="scripture"
		style="font-size: {fontSize}px; font-family: {fontFamilyMap[fontFamily]}; line-height: {lineHeightMap[lineSpacing]};"
	>
		{#each data.verses as verse}
			{@const mark = marks.get(parseInt(verse.verse))}
			<span
				class="verse-wrapper"
				class:selected={selectedVerses.has(verse.verse)}
				class:highlighted={!!mark}
				style={mark ? `--highlight-color: ${mark.color}` : ''}
				role="button"
				tabindex="0"
				aria-pressed={selectedVerses.has(verse.verse)}
				aria-label={`Verse ${verse.verse}`}
				onclick={(e) => toggleVerse(verse.verse, e)}
				onkeydown={(e) => toggleVerseKeyboard(verse.verse, e)}
			><span class="verse-num">{verse.verse}</span><span class="verse-text">{verse.text} </span>{#if mark?.comment}<button class="comment-indicator" onclick={(e) => { e.stopPropagation(); startComment(parseInt(verse.verse)); }} title="View comment" aria-label="View comment on verse {verse.verse}"><MessageSquareText size="11" /></button>{/if}</span>
			{#if commentingVerse === parseInt(verse.verse)}
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div class="comment-input-area" onclick={(e) => e.stopPropagation()}>
					<textarea
						class="comment-textarea"
						bind:value={commentText}
						placeholder="Add a comment..."
						rows="2"
					></textarea>
					<div class="comment-actions">
						<button class="btn btn-primary btn-sm" onclick={saveComment} disabled={savingMark}>Save</button>
						{#if marks.get(commentingVerse)?.comment}
							<button class="btn btn-danger btn-sm" onclick={() => { deleteComment(commentingVerse!); commentingVerse = null; }}>Delete</button>
						{/if}
						<button class="btn btn-secondary btn-sm" onclick={() => commentingVerse = null}>Cancel</button>
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<nav class="chapter-nav" aria-label="Chapter navigation">
		{#if data.prevLink}
			<a href={data.prevLink} class="chapter-nav-btn"><ChevronLeft size="17" /> Previous</a>
		{:else}
			<span></span>
		{/if}
		{#if data.nextLink}
			<a href={data.nextLink} class="chapter-nav-btn">Next <ChevronRight size="17" /></a>
		{:else}
			<span></span>
		{/if}
	</nav>
</div>

{#if selectedVerses.size > 0}
	<div class="verse-actions" role="toolbar" aria-label="Verse actions">
		<span class="ref">{selectedRef()}</span>
		<span class="divider"></span>
		<button onclick={copyVerses}><Copy size="14" /> <span class="btn-label">Copy</span></button>
		{#if session}
			<span class="divider"></span>
			<div class="highlight-colors">
				{#each HIGHLIGHT_COLORS as color}
					<button
						class="color-dot"
						style="background: {color}"
						onclick={() => highlightVerses(color)}
						disabled={savingMark}
						title="Highlight"
						aria-label="Highlight verse in color {color}"
					></button>
				{/each}
			</div>
			<span class="divider"></span>
			<button onclick={() => startComment([...selectedVerses].map(Number).sort((a, b) => a - b)[0])} disabled={savingMark}>
				<MessageSquareText size="14" /> <span class="btn-label">Comment</span>
			</button>
			{#if selectionHasMarks()}
				<span class="divider"></span>
				<button onclick={removeHighlights} disabled={savingMark}><Trash2 size="14" /> <span class="btn-label">Remove</span></button>
			{/if}
		{/if}
		<span class="divider"></span>
		<button onclick={clearSelection} aria-label="Clear selection"><X size="14" /></button>
	</div>
{/if}

{#if showCopied}
	<div class="copied-toast" role="status"><Copy size="13" /> Copied to clipboard</div>
{/if}

{#if showPicker}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="picker-overlay" onclick={() => { showPicker = false; pickerBook = null; }}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="picker-modal" onclick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Select a book and chapter">
			<button class="picker-close" onclick={() => { showPicker = false; pickerBook = null; }} aria-label="Close"><X size="17" /></button>
			{#if !pickerBook}
				<h2>Select a Book</h2>
				<div class="picker-tabs">
					<button class="picker-tab" class:active={selectedTestament === 'old'} onclick={() => selectedTestament = 'old'} aria-pressed={selectedTestament === 'old'}>
						Old Testament
					</button>
					<button class="picker-tab" class:active={selectedTestament === 'new'} onclick={() => selectedTestament = 'new'} aria-pressed={selectedTestament === 'new'}>
						New Testament
					</button>
				</div>
				<div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(136px, 1fr));">
					{#each displayedBooks as book}
						<button
							class="book-grid-item"
							class:active={book.slug === data.bookSlug}
							onclick={() => pickerBook = book.slug}
						>
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
			{:else if pickerBookInfo}
				<div class="picker-back-head">
					<button class="btn btn-secondary btn-sm" onclick={() => pickerBook = null} aria-label="Back to books">&larr;</button>
					<h2>{pickerBookInfo.name}</h2>
				</div>
				<div class="picker-section-label">{pickerBookInfo.chapters} chapters</div>
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
