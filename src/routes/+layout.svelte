<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';

	let { children, data } = $props();

	let theme = $state('light');

	function toggleTheme() {
		theme = theme === 'light' ? 'dark' : 'light';
		document.documentElement.setAttribute('data-theme', theme);
	}

	const isActive = (path: string) => {
		return page.url.pathname === path || page.url.pathname.startsWith(path + '/');
	};
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
		<button class="theme-toggle" onclick={toggleTheme} aria-label="Toggle theme">
			{theme === 'light' ? '☾' : '☀'}
		</button>
	</div>
</nav>

{@render children()}
