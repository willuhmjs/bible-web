<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import type { PageData } from './$types.js';
	import type { Translation } from '$lib/types.js';
	import { getMode } from '$lib/mode.svelte.js';

	let { data }: { data: PageData } = $props();

	let downloading = $state<string | null>(null);
	let removing = $state<string | null>(null);
	let errorMsg = $state<string | null>(null);

	const mode = $derived(getMode());

	const grouped = $derived(() => {
		const filtered = data.translations.filter((t) =>
			mode === 'catholic'
				? ('category' in t && t.category === 'catholic')
				: !('category' in t && t.category === 'catholic')
		);
		const groups = new Map<string, Translation[]>();
		for (const t of filtered) {
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

	const notInstalled = $derived(
		grouped().flatMap(([, translations]) => translations).filter((t) => !t.installed)
	);
	let downloadingAll = $state(false);

	async function downloadAll() {
		downloadingAll = true;
		errorMsg = null;
		for (const t of notInstalled) {
			downloading = t.id;
			try {
				const res = await fetch(`/api/translations/${t.id}`, { method: 'POST' });
				if (!res.ok) {
					const body = await res.json();
					errorMsg = body.error ?? `Failed to download ${t.abbreviation}`;
					break;
				}
				await invalidateAll();
			} catch {
				errorMsg = `Network error downloading ${t.abbreviation}`;
				break;
			}
		}
		downloading = null;
		downloadingAll = false;
	}

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
	<h1 class="page-title">{mode === 'catholic' ? 'Catholic' : 'Protestant'} Translations</h1>
	{#if notInstalled.length > 0}
		<div style="margin-bottom: 20px;">
			<button
				class="btn btn-primary"
				onclick={downloadAll}
				disabled={downloadingAll || downloading !== null}
			>
				{downloadingAll ? 'Downloading...' : 'Download All'}
			</button>
		</div>
	{/if}

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
									style="min-width: 100px;"
									onclick={() => download(t.id)}
									disabled={downloading !== null}
								>
									{#if downloading === t.id}
										<span class="spinner spinner-sm"></span>
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
