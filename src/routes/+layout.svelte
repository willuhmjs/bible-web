<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import { getMode, toggleMode } from '$lib/mode.svelte.js';

	let { children, data } = $props();

	let theme = $state('light');

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
	}

	const isActive = (path: string) => {
		return page.url.pathname === path || page.url.pathname.startsWith(path + '/');
	};

	const mode = $derived(getMode());
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
			<svg class="mode-slider-icon keys-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
				<line x1="4" y1="20" x2="20" y2="4" stroke="#C0A030" />
				<circle cx="6.5" cy="2.5" r="1.5" fill="#C0A030" />
				<path d="M3.5 21.5 L5 20 L4 19" stroke="#C0A030" fill="none" />
				<line x1="20" y1="20" x2="4" y2="4" stroke="#A0A0A0" />
				<circle cx="17.5" cy="2.5" r="1.5" fill="#A0A0A0" />
				<path d="M20.5 21.5 L19 20 L20 19" stroke="#A0A0A0" fill="none" />
			</svg>
		</div>
		<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
			{theme === 'light' ? '☾' : '☀'}
		</button>
	</div>
</nav>

{@render children()}
