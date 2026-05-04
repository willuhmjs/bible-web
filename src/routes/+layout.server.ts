import { getInstalledTranslations } from '$lib/bible.js';
import { AVAILABLE_TRANSLATIONS } from '$lib/translations.js';
import type { LayoutServerLoad } from './$types.js';

export const load: LayoutServerLoad = async () => {
	const installed = await getInstalledTranslations();
	const translations = AVAILABLE_TRANSLATIONS.filter((t) => installed.includes(t.id));

	return {
		installedTranslations: translations,
		defaultTranslation: translations[0]?.id ?? null
	};
};
