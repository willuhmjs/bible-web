import { searchBible } from '$lib/search.js';
import { getInstalledTranslations } from '$lib/bible.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ url }) => {
	const query = url.searchParams.get('q') ?? '';
	const translation = url.searchParams.get('t') ?? '';
	const installed = await getInstalledTranslations();

	const activeTranslation = installed.includes(translation) ? translation : installed[0] ?? '';

	let results: Awaited<ReturnType<typeof searchBible>> = [];
	if (query && activeTranslation) {
		results = await searchBible(activeTranslation, query);
	}

	return {
		query,
		translation: activeTranslation,
		results,
		installedIds: installed
	};
};
