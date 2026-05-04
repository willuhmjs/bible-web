import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { BOOKS } from './books.js';
import type { BookData } from './types.js';

const DATA_DIR = path.resolve('data/bibles');

export interface SearchResult {
	book: string;
	bookSlug: string;
	chapter: string;
	verse: string;
	text: string;
}

export async function searchBible(
	translationId: string,
	query: string,
	limit = 100
): Promise<SearchResult[]> {
	const dir = path.join(DATA_DIR, translationId);
	if (!existsSync(dir)) return [];

	const q = query.toLowerCase().trim();
	if (!q) return [];

	const results: SearchResult[] = [];

	for (const book of BOOKS) {
		if (results.length >= limit) break;

		const filePath = path.join(dir, `${book.slug}.json`);
		if (!existsSync(filePath)) continue;

		const raw = await readFile(filePath, 'utf-8');
		const data: BookData = JSON.parse(raw);

		for (const chapter of data.chapters) {
			for (const verse of chapter.verses) {
				if (verse.text.toLowerCase().includes(q)) {
					results.push({
						book: data.book,
						bookSlug: book.slug,
						chapter: chapter.chapter,
						verse: verse.verse,
						text: verse.text
					});
					if (results.length >= limit) break;
				}
			}
			if (results.length >= limit) break;
		}
	}

	return results;
}
