<script lang="ts">
	import { page } from '$app/state';
	import { BOOKS } from '$lib/books.js';
	import { getTranslation } from '$lib/mode.svelte.js';
	import type { PageData } from './$types.js';

	let { data }: { data: PageData } = $props();

	const translation = $derived(getTranslation());
	let importing = $state(false);
	let importResult = $state<string | null>(null);

	function bookName(slug: string): string {
		return BOOKS.find((b) => b.slug === slug)?.name ?? slug;
	}

	async function exportMarks() {
		const res = await fetch('/api/marks/export');
		if (!res.ok) return;
		const blob = await res.blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `bible-marks-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}

	async function importMarks() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = async () => {
			const file = input.files?.[0];
			if (!file) return;
			importing = true;
			importResult = null;
			try {
				const text = await file.text();
				const json = JSON.parse(text);
				const res = await fetch('/api/marks/import', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(json)
				});
				if (res.ok) {
					const result = await res.json();
					importResult = `Imported ${result.imported} marks. Reload to see changes.`;
				} else {
					importResult = 'Import failed.';
				}
			} catch {
				importResult = 'Invalid file.';
			}
			importing = false;
		};
		input.click();
	}

	const entries = $derived(Object.entries(data.grouped));
</script>

<svelte:head>
	<title>My Marks - Bible</title>
</svelte:head>

<div class="content">
	<div class="marks-toolbar">
		<h1 class="page-title" style="margin-bottom: 0;">My Marks</h1>
		<div class="marks-actions">
			<button class="btn btn-secondary btn-sm" onclick={exportMarks}>Export</button>
			<button class="btn btn-secondary btn-sm" onclick={importMarks} disabled={importing}>
				{importing ? 'Importing...' : 'Import'}
			</button>
		</div>
	</div>

	{#if importResult}
		<div class="import-result">{importResult}</div>
	{/if}

	{#if entries.length === 0}
		<div class="empty-state">
			<h2>No marks yet</h2>
			<p>Select verses while reading to highlight them or add comments.</p>
			<a href="/" class="btn btn-primary">Start Reading</a>
		</div>
	{:else}
		<p class="page-subtitle">{data.marks.length} mark{data.marks.length === 1 ? '' : 's'} across {entries.length} chapter{entries.length === 1 ? '' : 's'}</p>

		{#each entries as [key, chapterMarks]}
			{@const [bookSlug, chapter] = key.split('/')}
			<div class="marks-chapter">
				<a href="/bible/{translation}/{bookSlug}/{chapter}" class="marks-chapter-title">
					{bookName(bookSlug)} {chapter}
				</a>
				<div class="marks-list">
					{#each chapterMarks as mark}
						<div class="mark-item">
							<span class="mark-color-dot" style="background: {mark.color}"></span>
							<a href="/bible/{translation}/{bookSlug}/{chapter}" class="mark-ref">
								Verse {mark.verse}
							</a>
							{#if mark.comment}
								<span class="mark-comment">{mark.comment}</span>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		{/each}
	{/if}
</div>
