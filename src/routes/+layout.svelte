<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { browser } from '$app/environment';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { getMode, toggleMode, getTranslation, setTranslation, resolveTranslation, isCatholicTranslation } from '$lib/mode.svelte.js';

	let { children, data } = $props();

	const session = $derived(data.session);

	let theme = $state(
		browser
			? localStorage.getItem('bible-theme') ??
			  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
			: 'light'
	);
	let showTranslations = $state(false);

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
		localStorage.setItem('bible-theme', theme);
	}

	const isActive = (path: string) => {
		return page.url.pathname === path || page.url.pathname.startsWith(path + '/');
	};

	const mode = $derived(getMode());
	const isCatholic = $derived(mode === 'catholic');

	const installedIds = $derived(
		(data.installedTranslations ?? []).map((t: { id: string }) => t.id)
	);
	const translation = $derived(resolveTranslation(installedIds));

	const filteredTranslations = $derived(
		(data.installedTranslations ?? []).filter((t: { id: string }) =>
			isCatholic ? isCatholicTranslation(t.id) : !isCatholicTranslation(t.id)
		)
	);

	function switchTranslation(id: string) {
		showTranslations = false;
		setTranslation(id);
		const match = page.url.pathname.match(/^\/bible\/[^/]+\/(.+)/);
		if (match) {
			goto(`/bible/${id}/${match[1]}`);
		}
	}
</script>

<svelte:head>
	<title>Bible</title>
</svelte:head>

<nav class="nav">
	<a href="/" class="nav-logo">
		<span>B</span>ible
	</a>

	<div class="nav-links">
		<a href="/" class="nav-link" class:active={page.url.pathname === '/'}>Read</a>
		<a href="/search" class="nav-link" class:active={isActive('/search')}>Search</a>
		<a href="/translations" class="nav-link" class:active={isActive('/translations')}>Translations</a>
		{#if session}
			<a href="/marks" class="nav-link" class:active={isActive('/marks')}>Marks</a>
		{/if}
		{#if filteredTranslations.length > 0}
			<div class="translation-selector">
				<button class="translation-selector-btn" onclick={() => showTranslations = !showTranslations}>
					{translation.toUpperCase()} &#9662;
				</button>
				{#if showTranslations}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div style="position: fixed; inset: 0; z-index: 199;" onclick={() => showTranslations = false}></div>
					<div class="translation-dropdown">
						{#each filteredTranslations as t}
							<button
								class="translation-dropdown-item"
								class:active={t.id === translation}
								onclick={() => switchTranslation(t.id)}
							>
								<strong>{t.abbreviation}</strong> &mdash; {t.name}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/if}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div
			class="mode-slider"
			class:catholic={mode === 'catholic'}
			onclick={toggleMode}
			title="{mode === 'protestant' ? 'Protestant' : 'Catholic'} mode"
			role="switch"
			aria-checked={mode === 'catholic'}
			aria-label="Toggle Catholic mode"
		>
			<svg class="mode-slider-icon book-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<path d="M2 4c0 0 3-1 10-1s10 1 10 1v16c0 0-3-1-10-1s-10 1-10 1V4z" />
				<line x1="12" y1="3" x2="12" y2="20" />
			</svg>
			<div class="mode-slider-thumb"></div>
			<svg class="mode-slider-icon keys-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
		</div>
		<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
			{theme === 'light' ? '☾' : '☀'}
		</button>
		{#if session}
			<button class="btn btn-secondary btn-sm" onclick={() => signOut()}>Sign out</button>
		{:else}
			<button class="btn btn-primary btn-sm" onclick={() => signIn('authentik')}>Sign in</button>
		{/if}
	</div>
</nav>

{@render children()}
