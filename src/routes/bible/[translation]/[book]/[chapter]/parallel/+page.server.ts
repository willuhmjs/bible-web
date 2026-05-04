import { getChapter, getInstalledTranslations } from '$lib/bible.js';
import { getBookBySlug } from '$lib/books.js';
import { AVAILABLE_TRANSLATIONS } from '$lib/translations.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params, url }) => {
	const { translation, book, chapter } = params;
	const chapterNum = parseInt(chapter, 10);
	const compareWith = url.searchParams.get('compare') ?? '';

	const bookInfo = getBookBySlug(book);
	if (!bookInfo) error(404, 'Book not found');
	if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > bookInfo.chapters) {
		error(404, 'Chapter not found');
	}

	const installed = await getInstalledTranslations();
	const otherTranslations = installed.filter((id) => id !== translation);

	const secondTranslation = otherTranslations.includes(compareWith)
		? compareWith
		: otherTranslations[0] ?? '';

	const primary = await getChapter(translation, book, chapterNum);
	if (!primary) error(404, 'Chapter data not found');

	const secondary = secondTranslation
		? await getChapter(secondTranslation, book, chapterNum)
		: null;

	const translationMetas = AVAILABLE_TRANSLATIONS.filter((t) => installed.includes(t.id));

	return {
		bookName: primary.bookName,
		bookSlug: book,
		chapter: chapterNum,
		translation,
		primaryVerses: primary.verses,
		secondTranslation,
		secondaryVerses: secondary?.verses ?? [],
		availableTranslations: translationMetas,
		backLink: `/bible/${translation}/${book}/${chapter}`
	};
};
