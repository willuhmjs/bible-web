import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import { getChapter } from '$lib/bible.js';
import { VOTD_VERSES } from '$lib/votd.js';

export const GET: RequestHandler = async ({ url }) => {
	const translation = url.searchParams.get('translation');
	const dayParam = url.searchParams.get('day');

	if (!translation || dayParam === null) {
		return json({ error: 'Missing translation or day' }, { status: 400 });
	}

	const day = parseInt(dayParam);
	const index = day % VOTD_VERSES.length;
	const entry = VOTD_VERSES[index];

	const result = await getChapter(translation, entry.bookSlug, entry.chapter);
	if (!result) {
		return json({ text: null, ref: entry.ref });
	}

	const verse = result.verses.find((v) => v.verse === String(entry.verse));
	return json({
		text: verse?.text ?? null,
		ref: entry.ref
	});
};
