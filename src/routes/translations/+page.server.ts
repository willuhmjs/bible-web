import { listTranslations } from '$lib/bible.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async () => {
	const translations = await listTranslations();
	return { translations };
};
