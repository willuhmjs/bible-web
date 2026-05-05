import { readdir, readFile, writeFile, mkdir, rm } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { BOOKS, getBookBySlug } from './books.js';
import { AVAILABLE_TRANSLATIONS, getTranslationMeta } from './translations.js';
import type { BookData, Translation, Verse } from './types.js';

const DATA_DIR = path.resolve('data/bibles');
const GITHUB_REPO = 'willuhmjs/bible-web';
const GITHUB_BRANCH = 'main';

const activeDownloads = new Set<string>();

export function getActiveDownloads(): string[] {
	return [...activeDownloads];
}

function translationDir(translationId: string): string {
	return path.join(DATA_DIR, translationId);
}

export async function getInstalledTranslations(): Promise<string[]> {
	if (!existsSync(DATA_DIR)) {
		await mkdir(DATA_DIR, { recursive: true });
		return [];
	}
	const entries = await readdir(DATA_DIR, { withFileTypes: true });
	return entries.filter((e) => e.isDirectory()).map((e) => e.name);
}

export async function listTranslations(): Promise<Translation[]> {
	const installed = await getInstalledTranslations();
	return AVAILABLE_TRANSLATIONS.map((meta) => {
		if (installed.includes(meta.id)) {
			const bookCount = meta.category === 'catholic' ? 73 : 66;
			return { ...meta, installed: true as const, bookCount };
		}
		return { ...meta, installed: false as const };
	});
}

export async function getChapter(
	translationId: string,
	bookSlug: string,
	chapter: number
): Promise<{ verses: Verse[]; bookName: string } | null> {
	const book = getBookBySlug(bookSlug);
	if (!book) return null;
	if (chapter < 1 || chapter > book.chapters) return null;

	const dir = translationDir(translationId);
	const filePath = path.join(dir, `${book.slug}.json`);

	if (!existsSync(filePath)) return null;

	const raw = await readFile(filePath, 'utf-8');
	const data: BookData = JSON.parse(raw);
	const ch = data.chapters.find((c) => c.chapter === String(chapter));
	if (!ch) return null;

	return { verses: ch.verses, bookName: data.book };
}

export async function downloadTranslation(translationId: string): Promise<void> {
	const meta = getTranslationMeta(translationId);
	if (!meta) throw new Error(`Unknown translation: ${translationId}`);

	activeDownloads.add(translationId);
	try {
		const dir = translationDir(translationId);
		await mkdir(dir, { recursive: true });

		const baseUrl = `https://raw.githubusercontent.com/${GITHUB_REPO}/${GITHUB_BRANCH}/bibles/${translationId}`;

		for (const book of BOOKS) {
			const url = `${baseUrl}/${book.slug}.json`;
			const res = await fetch(url);
			if (!res.ok) continue;
			const data = await res.text();
			await writeFile(path.join(dir, `${book.slug}.json`), data);
		}
	} finally {
		activeDownloads.delete(translationId);
	}
}

export async function removeTranslation(translationId: string): Promise<void> {
	const dir = translationDir(translationId);
	if (existsSync(dir)) {
		await rm(dir, { recursive: true });
	}
}

export async function isTranslationInstalled(translationId: string): Promise<boolean> {
	return existsSync(translationDir(translationId));
}
