import { getChapter, isTranslationInstalled } from '$lib/bible.js';
import { getBookBySlug, getNextBook, getPrevBook } from '$lib/books.js';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ params }) => {
	const { translation, book, chapter } = params;
	const chapterNum = parseInt(chapter, 10);

	if (!(await isTranslationInstalled(translation))) {
		error(404, `Translation "${translation}" is not installed.`);
	}

	const bookInfo = getBookBySlug(book);
	if (!bookInfo) {
		error(404, `Book "${book}" not found.`);
	}

	if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > bookInfo.chapters) {
		error(404, `Chapter ${chapter} not found in ${bookInfo.name}.`);
	}

	const result = await getChapter(translation, book, chapterNum);
	if (!result) {
		error(404, 'Chapter data not found.');
	}

	let prevLink: string | null = null;
	let nextLink: string | null = null;

	if (chapterNum > 1) {
		prevLink = `/bible/${translation}/${book}/${chapterNum - 1}`;
	} else {
		const prev = getPrevBook(book);
		if (prev) {
			prevLink = `/bible/${translation}/${prev.slug}/${prev.chapters}`;
		}
	}

	if (chapterNum < bookInfo.chapters) {
		nextLink = `/bible/${translation}/${book}/${chapterNum + 1}`;
	} else {
		const next = getNextBook(book);
		if (next) {
			nextLink = `/bible/${translation}/${next.slug}/1`;
		}
	}

	return {
		verses: result.verses,
		bookName: result.bookName,
		bookSlug: book,
		chapter: chapterNum,
		totalChapters: bookInfo.chapters,
		translation,
		prevLink,
		nextLink
	};
};
