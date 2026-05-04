import { downloadTranslation, removeTranslation, isTranslationInstalled } from '$lib/bible.js';
import { getTranslationMeta } from '$lib/translations.js';
import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';

export const POST: RequestHandler = async ({ params }) => {
	const { id } = params;
	const meta = getTranslationMeta(id);
	if (!meta) error(404, 'Translation not found');

	if (await isTranslationInstalled(id)) {
		return json({ message: 'Already installed' });
	}

	try {
		await downloadTranslation(id);
		return json({ message: 'Downloaded successfully' });
	} catch (e) {
		console.error('Download failed:', e);
		error(500, 'Download failed');
	}
};

export const DELETE: RequestHandler = async ({ params }) => {
	const { id } = params;

	if (!(await isTranslationInstalled(id))) {
		error(404, 'Translation not installed');
	}

	await removeTranslation(id);
	return json({ message: 'Removed successfully' });
};
