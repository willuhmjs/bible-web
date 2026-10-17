<script lang="ts">
	import '../app.css';
	import { goto } from '$app/navigation';
	import { navigating, page } from '$app/state';
	import { browser } from '$app/environment';
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { BookMarked, BookOpen, BookOpenText, Library, LogIn, LogOut, Moon, Search, Sun } from 'lucide-svelte';
	import { getMode, toggleMode, getTranslation, setTranslation, resolveTranslation, isCatholicTranslation } from '$lib/mode.svelte.js';
	import favicon from '$lib/assets/favicon.svg';

	let { children, data } = $props();

	const session = $derived(data.session);

	let theme = $state(
		browser
			? new URLSearchParams(location.search).get('theme') ??
			  localStorage.getItem('bible-theme') ??
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
	<link rel="icon" href={favicon} />
	<meta
		name="description"
		content="A beautiful, self-hosted Bible reader with dozens of public-domain translations, full-text search, and parallel comparison."
	/>
</svelte:head>

<a class="skip-link" href="#main">Skip to content</a>

{#if navigating.to}
	<div class="route-progress" role="progressbar" aria-label="Loading"></div>
{/if}

<div class="page-shell">
	<header>
		<nav class="nav" aria-label="Main">
			<a href="/" class="nav-logo">
				<BookOpen size="22" aria-hidden="true" />
				<span>Bible</span>
			</a>

			<div class="nav-links">
				<a href="/" class="nav-link" class:active={page.url.pathname === '/'} aria-label="Read">
					<BookOpenText size="16" aria-hidden="true" />
					<span class="nav-label">Read</span>
				</a>
				<a href="/search" class="nav-link" class:active={isActive('/search')} aria-label="Search">
					<Search size="16" aria-hidden="true" />
					<span class="nav-label">Search</span>
				</a>
				<a href="/translations" class="nav-link" class:active={isActive('/translations')} aria-label="Translations">
					<Library size="16" aria-hidden="true" />
					<span class="nav-label">Translations</span>
				</a>
				{#if session}
					<a href="/marks" class="nav-link" class:active={isActive('/marks')} aria-label="Marks">
						<BookMarked size="16" aria-hidden="true" />
						<span class="nav-label">Marks</span>
					</a>
				{/if}
				{#if filteredTranslations.length > 0}
					<span class="nav-divider" aria-hidden="true"></span>
					<div class="translation-selector">
						<button
							class="translation-selector-btn"
							onclick={() => showTranslations = !showTranslations}
							aria-haspopup="listbox"
							aria-expanded={showTranslations}
							title="Switch translation"
						>
							{translation.toUpperCase()}
						</button>
						{#if showTranslations}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div style="position: fixed; inset: 0; z-index: 199;" onclick={() => showTranslations = false}></div>
							<div class="translation-dropdown" role="listbox" aria-label="Installed translations">
								{#each filteredTranslations as t}
									<button
										class="translation-dropdown-item"
										class:active={t.id === translation}
										role="option"
										aria-selected={t.id === translation}
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
					onkeydown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleMode(); } }}
					title="{mode === 'protestant' ? 'Protestant' : 'Catholic'} mode — click to toggle"
					role="switch"
					tabindex="0"
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
				</div>
				<button class="nav-icon-btn theme-toggle" onclick={toggleTheme} aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
					{#if theme === 'light'}
						<Moon size="18" />
					{:else}
						<Sun size="18" />
					{/if}
				</button>
				{#if session}
					<button class="btn btn-secondary btn-sm nav-auth" onclick={() => signOut()}><LogOut size="14" /> <span class="btn-label">Sign out</span></button>
				{:else}
					<button class="btn btn-primary btn-sm nav-auth" onclick={() => signIn('authentik')}><LogIn size="14" /> <span class="btn-label">Sign in</span></button>
				{/if}
			</div>
		</nav>
	</header>

	<main id="main" class="page-main">
		{@render children()}
	</main>

	<footer class="site-footer">
		<div class="footer-inner">
			<div class="footer-brand">
				<a href="/" class="nav-logo">
					<BookOpen size="20" aria-hidden="true" />
					<span>Bible</span>
				</a>
				<p>
					A self-hosted digital Scripture reader. Every translation is downloaded once and stored
					locally &mdash; your reading stays private, and it works offline.
				</p>
			</div>
			<div class="footer-links">
				<div class="footer-col">
					<h4>Read</h4>
					<a href="/">Start Reading</a>
					<a href="/translations">Translations</a>
					<a href="/search">Search Scripture</a>
				</div>
				<div class="footer-col">
					<h4>Study</h4>
					<a href="/search?q=faith">Full-text search</a>
					<a href="/">Parallel view</a>
					<a href="/">Verse of the day</a>
				</div>
				<div class="footer-col">
					<h4>About</h4>
					<span>All public-domain texts</span>
					<span>Protestant &amp; Catholic canons</span>
					<span>No tracking, ever</span>
				</div>
			</div>
		</div>
		<div class="footer-bottom">
			<span>Scripture text is public domain.</span>
			<span>Read beautifully. Host anywhere.</span>
		</div>
	</footer>
</div>
