import type { TranslationMeta } from './types.js';

export const AVAILABLE_TRANSLATIONS: TranslationMeta[] = [
	// ── English ──────────────────────────────────────────────
	{
		id: 'kjv',
		name: 'King James Version',
		abbreviation: 'KJV',
		language: 'English',
		description: 'The classic 1611 King James Version. Public domain.'
	},
	{
		id: 'akjv',
		name: 'American King James Version',
		abbreviation: 'AKJV',
		language: 'English',
		description: 'A modernized spelling update of the KJV. Public domain.'
	},
	{
		id: 'kjvpce',
		name: 'KJV Pure Cambridge Edition',
		abbreviation: 'KJVPCE',
		language: 'English',
		description: 'The definitive standard text of the King James Bible.'
	},
	{
		id: 'asv',
		name: 'American Standard Version',
		abbreviation: 'ASV',
		language: 'English',
		description: 'The 1901 American Standard Version. Public domain.'
	},
	{
		id: 'bsb',
		name: 'Berean Standard Bible',
		abbreviation: 'BSB',
		language: 'English',
		description: 'A modern, accurate, and readable English translation.'
	},
	{
		id: 'bbe',
		name: 'Bible in Basic English',
		abbreviation: 'BBE',
		language: 'English',
		description: 'A translation using simplified English vocabulary.'
	},
	{
		id: 'oeb',
		name: 'Open English Bible',
		abbreviation: 'OEB',
		language: 'English',
		description: 'A free, open-licensed modern English translation.'
	},
	{
		id: 'nheb',
		name: 'New Heart English Bible',
		abbreviation: 'NHEB',
		language: 'English',
		description: 'A public domain modern English translation.'
	},
	{
		id: 'leb',
		name: 'Lexham English Bible',
		abbreviation: 'LEB',
		language: 'English',
		description: 'A transparent, literal translation for English readers.'
	},
	{
		id: 'drc',
		name: 'Douay-Rheims Challoner',
		abbreviation: 'DRC',
		language: 'English',
		description: 'Classic Roman Catholic translation from the Latin Vulgate. Includes Deuterocanonical books. Public domain.',
		category: 'catholic'
	},
	{
		id: 'cpdv',
		name: 'Catholic Public Domain Version',
		abbreviation: 'CPDV',
		language: 'English',
		description: 'A modern Roman Catholic translation. Includes Deuterocanonical books. Public domain.',
		category: 'catholic'
	},
	{
		id: 'darby',
		name: 'Darby Translation',
		abbreviation: 'DBY',
		language: 'English',
		description: 'John Nelson Darby\'s 1890 translation. Public domain.'
	},
	{
		id: 'ylt',
		name: 'Young\'s Literal Translation',
		abbreviation: 'YLT',
		language: 'English',
		description: 'An extremely literal 1862 translation by Robert Young.'
	},
	{
		id: 'litv',
		name: 'Literal Translation of the Holy Bible',
		abbreviation: 'LITV',
		language: 'English',
		description: 'Jay P. Green\'s literal translation. Public domain.'
	},
	{
		id: 'mkjv',
		name: 'Modern King James Version',
		abbreviation: 'MKJV',
		language: 'English',
		description: 'A modern language update of the KJV by Jay P. Green.'
	},
	{
		id: 'rnkjv',
		name: 'Restored Name King James Version',
		abbreviation: 'RNKJV',
		language: 'English',
		description: 'KJV with Hebrew names for God restored.'
	},
	{
		id: 'rwebster',
		name: 'Revised Webster Version',
		abbreviation: 'RWB',
		language: 'English',
		description: 'Noah Webster\'s 1833 revision of the KJV.'
	},
	{
		id: 'geneva',
		name: 'Geneva Bible (1599)',
		abbreviation: 'GNV',
		language: 'English',
		description: 'The 1599 Geneva Bible, predecessor to the KJV.'
	},
	{
		id: 'tyndale',
		name: 'Tyndale Bible',
		abbreviation: 'TYN',
		language: 'English',
		description: 'William Tyndale\'s pioneering 1525 English translation.'
	},
	{
		id: 'wycliffe',
		name: 'Wycliffe Bible',
		abbreviation: 'WYC',
		language: 'English',
		description: 'John Wycliffe\'s 14th century English translation.'
	},
	{
		id: 'rotherham',
		name: 'Rotherham\'s Emphasized Bible',
		abbreviation: 'REB',
		language: 'English',
		description: 'Joseph Rotherham\'s 1902 translation with emphasis marks.'
	},
	{
		id: 'noyes',
		name: 'Noyes Translation',
		abbreviation: 'NOY',
		language: 'English',
		description: 'George Noyes\' 19th century translation.'
	},
	{
		id: 'anderson',
		name: 'Anderson New Testament',
		abbreviation: 'AND',
		language: 'English',
		description: 'H.T. Anderson\'s 1865 New Testament translation.'
	},
	{
		id: 'jps',
		name: 'Jewish Publication Society (1917)',
		abbreviation: 'JPS',
		language: 'English',
		description: 'The 1917 JPS Tanakh translation. Old Testament only.'
	},
	{
		id: 'jubilee',
		name: 'Jubilee Bible 2000',
		abbreviation: 'JUB',
		language: 'English',
		description: 'A modern translation from the original languages.'
	},

	// ── French ──────────────────────────────────────────────
	{
		id: 'frebdm',
		name: 'Bible David Martin (1744)',
		abbreviation: 'BDM',
		language: 'French',
		description: 'La Bible David Martin, traduction protestante classique.'
	},
	{
		id: 'frejnd',
		name: 'Bible J.N. Darby (Français)',
		abbreviation: 'JND',
		language: 'French',
		description: 'Traduction française de J.N. Darby.'
	},

	// ── German ──────────────────────────────────────────────
	{
		id: 'gersch',
		name: 'Schlachter Bibel',
		abbreviation: 'SCH',
		language: 'German',
		description: 'Die Schlachterbibel, eine beliebte deutsche Übersetzung.'
	},
	{
		id: 'gerelb',
		name: 'Elberfelder Bibel (1905)',
		abbreviation: 'ELB',
		language: 'German',
		description: 'Die wortgetreue Elberfelder Übersetzung von 1905.'
	},

	// ── Spanish ─────────────────────────────────────────────
	{
		id: 'sp',
		name: 'Spanish Purificada',
		abbreviation: 'SP',
		language: 'Spanish',
		description: 'La Biblia Española Purificada.'
	},

	// ── Portuguese ──────────────────────────────────────────
	{
		id: 'ptbr',
		name: 'Bible Livre',
		abbreviation: 'BLV',
		language: 'Portuguese',
		description: 'A Bíblia Livre em português.'
	},

	// ── Russian ─────────────────────────────────────────────
	{
		id: 'russyn',
		name: 'Russian Synodal Translation',
		abbreviation: 'RST',
		language: 'Russian',
		description: 'Синодальный перевод Библии.'
	},

	// ── Dutch ───────────────────────────────────────────────
	{
		id: 'dutsvv',
		name: 'Statenvertaling',
		abbreviation: 'SVV',
		language: 'Dutch',
		description: 'De klassieke Nederlandse Statenvertaling.'
	},

	// ── Finnish ─────────────────────────────────────────────
	{
		id: 'finpr',
		name: 'Finnish Pyhä Raamattu',
		abbreviation: 'PR',
		language: 'Finnish',
		description: 'Suomalainen Pyhä Raamattu -käännös.'
	},

	// ── Czech ───────────────────────────────────────────────
	{
		id: 'czebkr',
		name: 'Bible Kralická',
		abbreviation: 'BKR',
		language: 'Czech',
		description: 'Klasický český překlad Bible Kralická.'
	}
];

export function getTranslationMeta(id: string): TranslationMeta | undefined {
	return AVAILABLE_TRANSLATIONS.find((t) => t.id === id);
}
