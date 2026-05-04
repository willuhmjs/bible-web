export interface Verse {
	verse: string;
	text: string;
}

export interface Chapter {
	chapter: string;
	verses: Verse[];
}

export interface BookData {
	book: string;
	chapters: Chapter[];
}

export interface TranslationMeta {
	id: string;
	name: string;
	abbreviation: string;
	language: string;
	description: string;
	category?: 'catholic';
}

export interface InstalledTranslation extends TranslationMeta {
	installed: true;
	bookCount: number;
}

export interface AvailableTranslation extends TranslationMeta {
	installed: false;
}

export type Translation = InstalledTranslation | AvailableTranslation;
