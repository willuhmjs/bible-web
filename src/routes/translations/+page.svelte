<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types.js';
	import type { Translation } from '$lib/types.js';

	let { data }: { data: PageData } = $props();

	let downloading = $state<string | null>(null);
	let removing = $state<string | null>(null);
	let errorMsg = $state<string | null>(null);

	const grouped = $derived(() => {
		const groups = new Map<string, Translation[]>();
		for (const t of data.translations) {
			const lang = t.language;
			if (!groups.has(lang)) groups.set(lang, []);
			groups.get(lang)!.push(t);
		}
		const sorted = [...groups.entries()].sort((a, b) => {
			if (a[0] === 'English') return -1;
			if (b[0] === 'English') return 1;
			return a[0].localeCompare(b[0]);
		});
		return sorted;
	});

	async function download(id: string) {
		downloading = id;
		errorMsg = null;
		try {
			const res = await fetch(`/api/translations/${id}`, { method: 'POST' });
			if (!res.ok) {
				const body = await res.json();
				errorMsg = body.error ?? 'Download failed';
			}
			await invalidateAll();
		} catch {
			errorMsg = 'Network error';
		}
		downloading = null;
	}

	async function remove(id: string) {
		removing = id;
		errorMsg = null;
		try {
			const res = await fetch(`/api/translations/${id}`, { method: 'DELETE' });
			if (!res.ok) {
				const body = await res.json();
				errorMsg = body.error ?? 'Remove failed';
			}
			await invalidateAll();
		} catch {
			errorMsg = 'Network error';
		}
		removing = null;
	}
</script>

<svelte:head>
	<title>Translations - Bible</title>
</svelte:head>

<div class="content">
	<h1 class="page-title">Translations</h1>
	<p class="page-subtitle">Download Bible translations to read offline. All data is stored locally on the server.</p>

	{#if errorMsg}
		<div class="card" style="border-color: var(--color-danger); margin-bottom: 16px; color: var(--color-danger);">
			{errorMsg}
		</div>
	{/if}

	{#each grouped() as [language, translations]}
		<div class="language-group">
			<div class="language-group-title">{language}</div>
			<div style="display: flex; flex-direction: column; gap: 8px;">
				{#each translations as t (t.id)}
					<div class="card translation-card">
						<div class="translation-info">
							<h3>
								{t.name}
								<span class="abbreviation">{t.abbreviation}</span>
								{#if 'category' in t && t.category === 'catholic'}
									<span class="catholic-badge">Roman Catholic</span>
								{/if}
							</h3>
							<p>{t.description}</p>
						</div>
						<div style="flex-shrink: 0; display: flex; align-items: center; gap: 8px;">
							{#if t.installed}
								<span class="installed-badge">Installed</span>
								<button
									class="btn btn-danger btn-sm"
									onclick={() => remove(t.id)}
									disabled={removing === t.id}
								>
									{removing === t.id ? 'Removing...' : 'Remove'}
								</button>
							{:else}
								<button
									class="btn btn-primary btn-sm"
									onclick={() => download(t.id)}
									disabled={downloading !== null}
								>
									{#if downloading === t.id}
										<span class="spinner"></span> Downloading...
									{:else}
										Download
									{/if}
								</button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/each}
</div>
