export interface BookInfo {
	name: string;
	slug: string;
	chapters: number;
	testament: 'old' | 'new' | 'deuterocanonical';
}

export const BOOKS: BookInfo[] = [
	{ name: 'Genesis', slug: 'genesis', chapters: 50, testament: 'old' },
	{ name: 'Exodus', slug: 'exodus', chapters: 40, testament: 'old' },
	{ name: 'Leviticus', slug: 'leviticus', chapters: 27, testament: 'old' },
	{ name: 'Numbers', slug: 'numbers', chapters: 36, testament: 'old' },
	{ name: 'Deuteronomy', slug: 'deuteronomy', chapters: 34, testament: 'old' },
	{ name: 'Joshua', slug: 'joshua', chapters: 24, testament: 'old' },
	{ name: 'Judges', slug: 'judges', chapters: 21, testament: 'old' },
	{ name: 'Ruth', slug: 'ruth', chapters: 4, testament: 'old' },
	{ name: '1 Samuel', slug: '1-samuel', chapters: 31, testament: 'old' },
	{ name: '2 Samuel', slug: '2-samuel', chapters: 24, testament: 'old' },
	{ name: '1 Kings', slug: '1-kings', chapters: 22, testament: 'old' },
	{ name: '2 Kings', slug: '2-kings', chapters: 25, testament: 'old' },
	{ name: '1 Chronicles', slug: '1-chronicles', chapters: 29, testament: 'old' },
	{ name: '2 Chronicles', slug: '2-chronicles', chapters: 36, testament: 'old' },
	{ name: 'Ezra', slug: 'ezra', chapters: 10, testament: 'old' },
	{ name: 'Nehemiah', slug: 'nehemiah', chapters: 13, testament: 'old' },
	{ name: 'Esther', slug: 'esther', chapters: 10, testament: 'old' },
	{ name: 'Job', slug: 'job', chapters: 42, testament: 'old' },
	{ name: 'Psalms', slug: 'psalms', chapters: 150, testament: 'old' },
	{ name: 'Proverbs', slug: 'proverbs', chapters: 31, testament: 'old' },
	{ name: 'Ecclesiastes', slug: 'ecclesiastes', chapters: 12, testament: 'old' },
	{ name: 'Song of Solomon', slug: 'song-of-solomon', chapters: 8, testament: 'old' },
	{ name: 'Isaiah', slug: 'isaiah', chapters: 66, testament: 'old' },
	{ name: 'Jeremiah', slug: 'jeremiah', chapters: 52, testament: 'old' },
	{ name: 'Lamentations', slug: 'lamentations', chapters: 5, testament: 'old' },
	{ name: 'Ezekiel', slug: 'ezekiel', chapters: 48, testament: 'old' },
	{ name: 'Daniel', slug: 'daniel', chapters: 12, testament: 'old' },
	{ name: 'Hosea', slug: 'hosea', chapters: 14, testament: 'old' },
	{ name: 'Joel', slug: 'joel', chapters: 3, testament: 'old' },
	{ name: 'Amos', slug: 'amos', chapters: 9, testament: 'old' },
	{ name: 'Obadiah', slug: 'obadiah', chapters: 1, testament: 'old' },
	{ name: 'Jonah', slug: 'jonah', chapters: 4, testament: 'old' },
	{ name: 'Micah', slug: 'micah', chapters: 7, testament: 'old' },
	{ name: 'Nahum', slug: 'nahum', chapters: 3, testament: 'old' },
	{ name: 'Habakkuk', slug: 'habakkuk', chapters: 3, testament: 'old' },
	{ name: 'Zephaniah', slug: 'zephaniah', chapters: 3, testament: 'old' },
	{ name: 'Haggai', slug: 'haggai', chapters: 2, testament: 'old' },
	{ name: 'Zechariah', slug: 'zechariah', chapters: 14, testament: 'old' },
	{ name: 'Malachi', slug: 'malachi', chapters: 4, testament: 'old' },
	{ name: 'Matthew', slug: 'matthew', chapters: 28, testament: 'new' },
	{ name: 'Mark', slug: 'mark', chapters: 16, testament: 'new' },
	{ name: 'Luke', slug: 'luke', chapters: 24, testament: 'new' },
	{ name: 'John', slug: 'john', chapters: 21, testament: 'new' },
	{ name: 'Acts', slug: 'acts', chapters: 28, testament: 'new' },
	{ name: 'Romans', slug: 'romans', chapters: 16, testament: 'new' },
	{ name: '1 Corinthians', slug: '1-corinthians', chapters: 16, testament: 'new' },
	{ name: '2 Corinthians', slug: '2-corinthians', chapters: 13, testament: 'new' },
	{ name: 'Galatians', slug: 'galatians', chapters: 6, testament: 'new' },
	{ name: 'Ephesians', slug: 'ephesians', chapters: 6, testament: 'new' },
	{ name: 'Philippians', slug: 'philippians', chapters: 4, testament: 'new' },
	{ name: 'Colossians', slug: 'colossians', chapters: 4, testament: 'new' },
	{ name: '1 Thessalonians', slug: '1-thessalonians', chapters: 5, testament: 'new' },
	{ name: '2 Thessalonians', slug: '2-thessalonians', chapters: 3, testament: 'new' },
	{ name: '1 Timothy', slug: '1-timothy', chapters: 6, testament: 'new' },
	{ name: '2 Timothy', slug: '2-timothy', chapters: 4, testament: 'new' },
	{ name: 'Titus', slug: 'titus', chapters: 3, testament: 'new' },
	{ name: 'Philemon', slug: 'philemon', chapters: 1, testament: 'new' },
	{ name: 'Hebrews', slug: 'hebrews', chapters: 13, testament: 'new' },
	{ name: 'James', slug: 'james', chapters: 5, testament: 'new' },
	{ name: '1 Peter', slug: '1-peter', chapters: 5, testament: 'new' },
	{ name: '2 Peter', slug: '2-peter', chapters: 3, testament: 'new' },
	{ name: '1 John', slug: '1-john', chapters: 5, testament: 'new' },
	{ name: '2 John', slug: '2-john', chapters: 1, testament: 'new' },
	{ name: '3 John', slug: '3-john', chapters: 1, testament: 'new' },
	{ name: 'Jude', slug: 'jude', chapters: 1, testament: 'new' },
	{ name: 'Revelation', slug: 'revelation', chapters: 22, testament: 'new' },

	// Deuterocanonical books (Roman Catholic canon)
	{ name: 'Tobit', slug: 'tobit', chapters: 14, testament: 'deuterocanonical' },
	{ name: 'Judith', slug: 'judith', chapters: 16, testament: 'deuterocanonical' },
	{ name: 'Wisdom', slug: 'wisdom', chapters: 19, testament: 'deuterocanonical' },
	{ name: 'Sirach', slug: 'sirach', chapters: 51, testament: 'deuterocanonical' },
	{ name: 'Baruch', slug: 'baruch', chapters: 6, testament: 'deuterocanonical' },
	{ name: '1 Maccabees', slug: '1-maccabees', chapters: 16, testament: 'deuterocanonical' },
	{ name: '2 Maccabees', slug: '2-maccabees', chapters: 15, testament: 'deuterocanonical' }
];

export function getBookBySlug(slug: string): BookInfo | undefined {
	return BOOKS.find((b) => b.slug === slug);
}

export function getBookByName(name: string): BookInfo | undefined {
	return BOOKS.find((b) => b.name.toLowerCase() === name.toLowerCase());
}

export function getNextBook(slug: string): BookInfo | undefined {
	const idx = BOOKS.findIndex((b) => b.slug === slug);
	return idx >= 0 && idx < BOOKS.length - 1 ? BOOKS[idx + 1] : undefined;
}

export function getPrevBook(slug: string): BookInfo | undefined {
	const idx = BOOKS.findIndex((b) => b.slug === slug);
	return idx > 0 ? BOOKS[idx - 1] : undefined;
}
