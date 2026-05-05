import { browser } from '$app/environment';
import { AVAILABLE_TRANSLATIONS } from './translations.js';

export type BibleMode = 'protestant' | 'catholic';

let mode = $state<BibleMode>(
	browser ? (localStorage.getItem('bible-mode') as BibleMode) ?? 'protestant' : 'protestant'
);

let currentTranslation = $state<string>(
	browser ? localStorage.getItem(`bible-last-translation-${mode}`) ?? '' : ''
);

export function getMode(): BibleMode {
	return mode;
}

export function setMode(newMode: BibleMode) {
	mode = newMode;
	if (browser) {
		localStorage.setItem('bible-mode', newMode);
		currentTranslation = localStorage.getItem(`bible-last-translation-${newMode}`) ?? '';
	}
}

export function toggleMode() {
	setMode(mode === 'protestant' ? 'catholic' : 'protestant');
}

export function getTranslation(): string {
	return currentTranslation;
}

export function setTranslation(translationId: string) {
	currentTranslation = translationId;
	if (browser) {
		localStorage.setItem(`bible-last-translation-${mode}`, translationId);
	}
}

export function isCatholicTranslation(id: string): boolean {
	return AVAILABLE_TRANSLATIONS.find((a) => a.id === id)?.category === 'catholic';
}

export function resolveTranslation(installedIds: string[]): string {
	const isCatholic = mode === 'catholic';
	const matching = installedIds.filter((id) =>
		isCatholic ? isCatholicTranslation(id) : !isCatholicTranslation(id)
	);
	if (currentTranslation && matching.includes(currentTranslation)) {
		return currentTranslation;
	}
	return matching[0] ?? installedIds[0] ?? '';
}
