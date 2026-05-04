import { writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const BIBLES_DIR = path.resolve('bibles');

interface BookInfo {
	name: string;
	slug: string;
}

const BOOKS: BookInfo[] = [
	{ name: 'Genesis', slug: 'genesis' },
	{ name: 'Exodus', slug: 'exodus' },
	{ name: 'Leviticus', slug: 'leviticus' },
	{ name: 'Numbers', slug: 'numbers' },
	{ name: 'Deuteronomy', slug: 'deuteronomy' },
	{ name: 'Joshua', slug: 'joshua' },
	{ name: 'Judges', slug: 'judges' },
	{ name: 'Ruth', slug: 'ruth' },
	{ name: '1 Samuel', slug: '1-samuel' },
	{ name: '2 Samuel', slug: '2-samuel' },
	{ name: '1 Kings', slug: '1-kings' },
	{ name: '2 Kings', slug: '2-kings' },
	{ name: '1 Chronicles', slug: '1-chronicles' },
	{ name: '2 Chronicles', slug: '2-chronicles' },
	{ name: 'Ezra', slug: 'ezra' },
	{ name: 'Nehemiah', slug: 'nehemiah' },
	{ name: 'Esther', slug: 'esther' },
	{ name: 'Job', slug: 'job' },
	{ name: 'Psalms', slug: 'psalms' },
	{ name: 'Proverbs', slug: 'proverbs' },
	{ name: 'Ecclesiastes', slug: 'ecclesiastes' },
	{ name: 'Song of Solomon', slug: 'song-of-solomon' },
	{ name: 'Isaiah', slug: 'isaiah' },
	{ name: 'Jeremiah', slug: 'jeremiah' },
	{ name: 'Lamentations', slug: 'lamentations' },
	{ name: 'Ezekiel', slug: 'ezekiel' },
	{ name: 'Daniel', slug: 'daniel' },
	{ name: 'Hosea', slug: 'hosea' },
	{ name: 'Joel', slug: 'joel' },
	{ name: 'Amos', slug: 'amos' },
	{ name: 'Obadiah', slug: 'obadiah' },
	{ name: 'Jonah', slug: 'jonah' },
	{ name: 'Micah', slug: 'micah' },
	{ name: 'Nahum', slug: 'nahum' },
	{ name: 'Habakkuk', slug: 'habakkuk' },
	{ name: 'Zephaniah', slug: 'zephaniah' },
	{ name: 'Haggai', slug: 'haggai' },
	{ name: 'Zechariah', slug: 'zechariah' },
	{ name: 'Malachi', slug: 'malachi' },
	{ name: 'Matthew', slug: 'matthew' },
	{ name: 'Mark', slug: 'mark' },
	{ name: 'Luke', slug: 'luke' },
	{ name: 'John', slug: 'john' },
	{ name: 'Acts', slug: 'acts' },
	{ name: 'Romans', slug: 'romans' },
	{ name: '1 Corinthians', slug: '1-corinthians' },
	{ name: '2 Corinthians', slug: '2-corinthians' },
	{ name: 'Galatians', slug: 'galatians' },
	{ name: 'Ephesians', slug: 'ephesians' },
	{ name: 'Philippians', slug: 'philippians' },
	{ name: 'Colossians', slug: 'colossians' },
	{ name: '1 Thessalonians', slug: '1-thessalonians' },
	{ name: '2 Thessalonians', slug: '2-thessalonians' },
	{ name: '1 Timothy', slug: '1-timothy' },
	{ name: '2 Timothy', slug: '2-timothy' },
	{ name: 'Titus', slug: 'titus' },
	{ name: 'Philemon', slug: 'philemon' },
	{ name: 'Hebrews', slug: 'hebrews' },
	{ name: 'James', slug: 'james' },
	{ name: '1 Peter', slug: '1-peter' },
	{ name: '2 Peter', slug: '2-peter' },
	{ name: '1 John', slug: '1-john' },
	{ name: '2 John', slug: '2-john' },
	{ name: '3 John', slug: '3-john' },
	{ name: 'Jude', slug: 'jude' },
	{ name: 'Revelation', slug: 'revelation' },

	// Deuterocanonical books (Roman Catholic canon)
	{ name: 'Tobit', slug: 'tobit' },
	{ name: 'Judith', slug: 'judith' },
	{ name: 'Wisdom', slug: 'wisdom' },
	{ name: 'Sirach', slug: 'sirach' },
	{ name: 'Baruch', slug: 'baruch' },
	{ name: '1 Maccabees', slug: '1-maccabees' },
	{ name: '2 Maccabees', slug: '2-maccabees' }
];

interface BookData {
	book: string;
	chapters: Array<{
		chapter: string;
		verses: Array<{ verse: string; text: string }>;
	}>;
}

function normalizeBookName(name: string): string {
	let n = name.toLowerCase().trim();
	n = n.replace(/^iii\b/, '3').replace(/^ii\b/, '2').replace(/^i\b/, '1');
	n = n.replace(/^(1|2|3)([a-z])/, '$1 $2');
	n = n.replace('revelation of john', 'revelation');
	n = n.replace('song of songs', 'song of solomon');
	n = n.replace('wisdom of solomon', 'wisdom');
	n = n.replace('ecclesiasticus', 'sirach');
	return n;
}

interface ScrollmapperData {
	translation: string;
	books: Array<{
		name: string;
		chapters: Array<{
			chapter: number;
			verses: Array<{ verse: number; text: string }>;
		}>;
	}>;
}

async function downloadScrollmapper(sourceId: string, targetDir: string): Promise<number> {
	const url = `https://raw.githubusercontent.com/scrollmapper/bible_databases/master/formats/json/${sourceId}.json`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`Failed: ${res.status} for ${sourceId}`);

	const data: ScrollmapperData = await res.json();
	let count = 0;

	for (const srcBook of data.books) {
		const normalized = normalizeBookName(srcBook.name);
		const bookInfo = BOOKS.find(
			(b) =>
				b.name.toLowerCase() === normalized ||
				b.name.toLowerCase().replace(/ /g, '') === normalized.replace(/ /g, '')
		);
		if (!bookInfo) {
			console.warn(`  Could not match book: ${srcBook.name}`);
			continue;
		}

		const bookData: BookData = {
			book: bookInfo.name,
			chapters: srcBook.chapters.map((ch) => ({
				chapter: String(ch.chapter),
				verses: ch.verses.map((v) => ({
					verse: String(v.verse),
					text: v.text
				}))
			}))
		};

		await writeFile(path.join(targetDir, `${bookInfo.slug}.json`), JSON.stringify(bookData));
		count++;
	}

	return count;
}

async function downloadAruljohn(repoName: string, targetDir: string): Promise<number> {
	const baseUrl = `https://raw.githubusercontent.com/aruljohn/${repoName}/master`;
	let count = 0;

	for (const book of BOOKS) {
		const fileName = book.name.replace(/ /g, '%20');
		const url = `${baseUrl}/${fileName}.json`;

		let res = await fetch(url);
		if (!res.ok) {
			const alts = [];
			if (book.name === 'Song of Solomon') alts.push('Song of Songs', 'SongofSolomon');
			if (book.name === 'Psalms') alts.push('Psalm');
			if (book.name.match(/^\d /)) alts.push(book.name.replace(/^(\d) /, '$1'));

			let found = false;
			for (const alt of alts) {
				const altRes = await fetch(`${baseUrl}/${alt.replace(/ /g, '%20')}.json`);
				if (altRes.ok) {
					const data = await altRes.json();
					await writeFile(path.join(targetDir, `${book.slug}.json`), JSON.stringify(data));
					count++;
					found = true;
					break;
				}
			}
			if (!found) console.warn(`  Missing: ${book.name}`);
			continue;
		}

		const data = await res.json();
		await writeFile(path.join(targetDir, `${book.slug}.json`), JSON.stringify(data));
		count++;
	}

	return count;
}

interface TehShrikeItem {
	type: string;
	chapterNumber?: number;
	verseNumber?: number;
	value?: string;
}

async function downloadTehShrike(repoName: string, targetDir: string): Promise<number> {
	const baseUrl = `https://raw.githubusercontent.com/TehShrike/${repoName}/master/json`;
	let count = 0;

	for (const book of BOOKS) {
		const fileName = book.slug.replace(/-/g, '');
		const url = `${baseUrl}/${fileName}.json`;

		const res = await fetch(url);
		if (!res.ok) {
			console.warn(`  Missing: ${book.name}`);
			continue;
		}

		const items: TehShrikeItem[] = await res.json();
		const verseItems = items.filter(
			(item) =>
				(item.type === 'paragraph text' || item.type === 'line text') &&
				item.chapterNumber != null &&
				item.verseNumber != null &&
				item.value
		);

		const chaptersMap = new Map<number, Map<number, string>>();
		for (const item of verseItems) {
			const ch = item.chapterNumber!;
			const v = item.verseNumber!;
			if (!chaptersMap.has(ch)) chaptersMap.set(ch, new Map());
			const verses = chaptersMap.get(ch)!;
			const existing = verses.get(v) ?? '';
			verses.set(v, (existing + ' ' + item.value!.trim()).trim());
		}

		const bookData: BookData = {
			book: book.name,
			chapters: [...chaptersMap.entries()]
				.sort(([a], [b]) => a - b)
				.map(([ch, verses]) => ({
					chapter: String(ch),
					verses: [...verses.entries()]
						.sort(([a], [b]) => a - b)
						.map(([v, text]) => ({
							verse: String(v),
							text
						}))
				}))
		};

		await writeFile(path.join(targetDir, `${book.slug}.json`), JSON.stringify(bookData));
		count++;
	}

	return count;
}

interface TranslationSource {
	id: string;
	name: string;
	type: 'scrollmapper' | 'aruljohn' | 'tehshrike';
	sourceId: string;
}

const TRANSLATIONS: TranslationSource[] = [
	// English - aruljohn
	{ id: 'kjv', name: 'King James Version', type: 'aruljohn', sourceId: 'Bible-kjv' },

	// English - tehshrike
	{ id: 'web', name: 'World English Bible', type: 'tehshrike', sourceId: 'world-english-bible' },

	// English - scrollmapper
	{ id: 'akjv', name: 'American King James Version', type: 'scrollmapper', sourceId: 'AKJV' },
	{ id: 'asv', name: 'American Standard Version', type: 'scrollmapper', sourceId: 'ASV' },
	{ id: 'bbe', name: 'Bible in Basic English', type: 'scrollmapper', sourceId: 'BBE' },
	{ id: 'bsb', name: 'Berean Standard Bible', type: 'scrollmapper', sourceId: 'BSB' },
	{ id: 'darby', name: 'Darby Translation', type: 'scrollmapper', sourceId: 'Darby' },
	{ id: 'drc', name: 'Douay-Rheims Challoner', type: 'scrollmapper', sourceId: 'DRC' },
	{ id: 'geneva', name: 'Geneva Bible (1599)', type: 'scrollmapper', sourceId: 'Geneva1599' },
	{ id: 'jps', name: 'Jewish Publication Society (1917)', type: 'scrollmapper', sourceId: 'JPS' },
	{ id: 'jubilee', name: 'Jubilee Bible 2000', type: 'scrollmapper', sourceId: 'Jubilee2000' },
	{ id: 'kjvpce', name: 'KJV Pure Cambridge Edition', type: 'scrollmapper', sourceId: 'KJVPCE' },
	{ id: 'leb', name: 'Lexham English Bible', type: 'scrollmapper', sourceId: 'LEB' },
	{ id: 'litv', name: 'Literal Translation', type: 'scrollmapper', sourceId: 'LITV' },
	{ id: 'mkjv', name: 'Modern King James Version', type: 'scrollmapper', sourceId: 'MKJV' },
	{ id: 'nheb', name: 'New Heart English Bible', type: 'scrollmapper', sourceId: 'NHEB' },
	{ id: 'noyes', name: 'Noyes Translation', type: 'scrollmapper', sourceId: 'Noyes' },
	{ id: 'oeb', name: 'Open English Bible', type: 'scrollmapper', sourceId: 'OEB' },
	{ id: 'rnkjv', name: 'Restored Name King James Version', type: 'scrollmapper', sourceId: 'RNKJV' },
	{ id: 'rotherham', name: "Rotherham's Emphasized Bible", type: 'scrollmapper', sourceId: 'Rotherham' },
	{ id: 'rwebster', name: 'Revised Webster Version', type: 'scrollmapper', sourceId: 'RWebster' },
	{ id: 'tyndale', name: 'Tyndale Bible', type: 'scrollmapper', sourceId: 'Tyndale' },
	{ id: 'wycliffe', name: 'Wycliffe Bible', type: 'scrollmapper', sourceId: 'Wycliffe' },
	{ id: 'ylt', name: "Young's Literal Translation", type: 'scrollmapper', sourceId: 'YLT' },
	{ id: 'anderson', name: 'Anderson New Testament', type: 'scrollmapper', sourceId: 'Anderson' },
	{ id: 'cpdv', name: 'Catholic Public Domain Version', type: 'scrollmapper', sourceId: 'CPDV' },

	// French
	{ id: 'frebdm', name: 'Bible David Martin (1744)', type: 'scrollmapper', sourceId: 'FreBDM1744' },
	{ id: 'frejnd', name: 'Bible J.N. Darby (Français)', type: 'scrollmapper', sourceId: 'FreJND' },

	// German
	{ id: 'gersch', name: 'Schlachter Bibel', type: 'scrollmapper', sourceId: 'GerSch' },
	{ id: 'gerelb', name: 'Elberfelder Bibel (1905)', type: 'scrollmapper', sourceId: 'GerElb1905' },

	// Spanish
	{ id: 'sp', name: 'Spanish Purificada', type: 'scrollmapper', sourceId: 'SP' },

	// Portuguese
	{ id: 'ptbr', name: 'Bible Livre', type: 'scrollmapper', sourceId: 'PorBLivre' },

	// Russian
	{ id: 'russyn', name: 'Russian Synodal Translation', type: 'scrollmapper', sourceId: 'RusSynodal' },

	// Dutch
	{ id: 'dutsvv', name: 'Statenvertaling', type: 'scrollmapper', sourceId: 'DutSVV' },

	// Finnish
	{ id: 'finpr', name: 'Finnish Pyhä Raamattu', type: 'scrollmapper', sourceId: 'FinPR' },

	// Czech
	{ id: 'czebkr', name: 'Bible Kralická', type: 'scrollmapper', sourceId: 'CzeBKR' },
];

async function main() {
	console.log(`Building ${TRANSLATIONS.length} translations into ${BIBLES_DIR}/\n`);

	await mkdir(BIBLES_DIR, { recursive: true });

	let success = 0;
	let failed = 0;

	for (const t of TRANSLATIONS) {
		const dir = path.join(BIBLES_DIR, t.id);

		if (existsSync(dir)) {
			const files = await readdir(dir);
			if (files.length > 0) {
				console.log(`✓ ${t.id} (${t.name}) - already exists (${files.length} books)`);
				success++;
				continue;
			}
		}

		await mkdir(dir, { recursive: true });
		process.stdout.write(`  ${t.id} (${t.name})...`);

		try {
			let count: number;
			if (t.type === 'aruljohn') {
				count = await downloadAruljohn(t.sourceId, dir);
			} else if (t.type === 'tehshrike') {
				count = await downloadTehShrike(t.sourceId, dir);
			} else {
				count = await downloadScrollmapper(t.sourceId, dir);
			}
			console.log(` ✓ ${count} books`);
			success++;
		} catch (e) {
			console.log(` ✗ ${(e as Error).message}`);
			failed++;
		}
	}

	console.log(`\nDone: ${success} succeeded, ${failed} failed`);
}

main().catch(console.error);
