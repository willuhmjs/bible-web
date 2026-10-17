<script lang="ts">
	import { BookOpen } from 'lucide-svelte';
	import { page } from '$app/state';

	const status = $derived(page.status);
	const is404 = $derived(status === 404);
</script>

<svelte:head>
	<title>{is404 ? 'Not Found' : 'Something Went Wrong'} - Bible</title>
</svelte:head>

<div class="content">
	<div class="empty-state">
		<span class="empty-icon"><BookOpen size="28" /></span>
		<h2>{is404 ? 'This passage could not be found' : 'Something went wrong'}</h2>
		<p>
			{#if is404}
				The chapter or translation you are looking for is not installed here. It may need to be
				downloaded first.
			{:else}
				{page.error?.message ?? 'An unexpected error occurred.'}
			{/if}
		</p>
		<div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
			<a href="/" class="btn btn-primary">Start Reading</a>
			<a href="/translations" class="btn btn-secondary">Browse Translations</a>
		</div>
		<p style="margin-top: 28px; font-size: 12.5px; color: var(--color-text-muted);">Error {status}</p>
	</div>
</div>
