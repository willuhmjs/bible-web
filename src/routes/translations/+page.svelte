<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { onDestroy } from 'svelte';
	import { Check, Download, Library, Trash2 } from 'lucide-svelte';
	import type { PageData } from './$types.js';
	import type { Translation } from '$lib/types.js';
	import { getMode } from '$lib/mode.svelte.js';

	let { data }: { data: PageData } = $props();

	let clientDownloading = $state<Set<string>>(new Set());
	let removing = $state<string | null>(null);
	let errorMsg = $state<string | null>(null);

	const busyIds = $derived(new Set([...clientDownloading, ...data.activeDownloads]));
	const isBusy = $derived(busyIds.size > 0);

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

	let pollTimer: ReturnType<typeof setInterval> | null = null;

	$effect(() => {
		if (data.activeDownloads.length > 0 && !pollTimer) {
			pollTimer = setInterval(() => invalidateAll(), 2000);
		}
		if (data.activeDownloads.length === 0 && pollTimer) {
			clearInterval(pollTimer);
			pollTimer = null;
		}
	});

	onDestroy(() => {
		if (pollTimer) clearInterval(pollTimer);
	});

	async function downloadOne(id: string) {
		clientDownloading = new Set([...clientDownloading, id]);
		try {
			const res = await fetch(`/api/translations/${id}`, { method: 'POST' });
			if (!res.ok) {
				const body = await res.json();
				throw new Error(body.error ?? 'Download failed');
			}
		} finally {
			const next = new Set(clientDownloading);
			next.delete(id);
			clientDownloading = next;
			await invalidateAll();
		}
	}

	async function downloadAll() {
		errorMsg = null;
		for (const t of notInstalled) {
			try {
				await downloadOne(t.id);
			} catch (e: any) {
				errorMsg = e.message ?? `Failed to download ${t.abbreviation}`;
				break;
			}
		}
	}

	async function download(id: string) {
		errorMsg = null;
		try {
			await downloadOne(id);
		} catch (e: any) {
			errorMsg = e.message ?? 'Download failed';
		}
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

<div class="content" style="max-width: 860px;">
	<div class="trans-toolbar">
		<div>
			<h1 class="page-title" style="margin-bottom: 4px;">{mode === 'catholic' ? 'Catholic' : 'Protestant'} Translations</h1>
			<p style="color: var(--color-text-secondary); font-size: 14px;">
				Stored on your server once, readable forever &mdash; no account needed.
			</p>
		</div>
		{#if notInstalled.length > 0}
			<button
				class="btn btn-primary"
				onclick={downloadAll}
				disabled={isBusy}
			>
				{#if isBusy}
					<span class="spinner spinner-sm"></span> Downloading...
				{:else}
					<Download size="16" /> Download All ({notInstalled.length})
				{/if}
			</button>
		{/if}
	</div>

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
					<div class="card translation-card" class:is-installed={t.installed}>
						<div class="translation-info">
							<h3>
								{t.name}
								<span class="abbreviation">{t.abbreviation}</span>
							</h3>
							<p>{t.description}</p>
						</div>
						<div class="translation-card-actions">
							{#if t.installed}
								<span class="installed-badge"><Check size="13" /> Installed</span>
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
									style="min-width: 110px;"
									onclick={() => download(t.id)}
									disabled={isBusy}
								>
									{#if busyIds.has(t.id)}
										<span class="spinner spinner-sm"></span>
									{:else}
										<Download size="14" /> Download
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
