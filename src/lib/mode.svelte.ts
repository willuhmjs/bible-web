import { browser } from '$app/environment';

export type BibleMode = 'protestant' | 'catholic';

let mode = $state<BibleMode>(
	browser ? (localStorage.getItem('bible-mode') as BibleMode) ?? 'protestant' : 'protestant'
);

export function getMode(): BibleMode {
	return mode;
}

export function setMode(newMode: BibleMode) {
	mode = newMode;
	if (browser) {
		localStorage.setItem('bible-mode', newMode);
	}
}

export function toggleMode() {
	setMode(mode === 'protestant' ? 'catholic' : 'protestant');
}

export function getLastTranslation(m: BibleMode): string | null {
	if (!browser) return null;
	return localStorage.getItem(`bible-last-translation-${m}`);
}

export function setLastTranslation(m: BibleMode, translationId: string) {
	if (browser) {
		localStorage.setItem(`bible-last-translation-${m}`, translationId);
	}
}
