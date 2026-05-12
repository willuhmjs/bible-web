import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import prisma from '$lib/server/db.js';

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) return error(401);

	const book = event.url.searchParams.get('book');
	const chapter = event.url.searchParams.get('chapter');

	const where: Record<string, unknown> = { userId: session.user.id };
	if (book) where.book = book;
	if (chapter) where.chapter = parseInt(chapter);

	const marks = await prisma.mark.findMany({ where, orderBy: { verse: 'asc' } });
	return json(marks);
};

export const PUT: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) return error(401);

	const { book, chapter, verse, color, comment } = await event.request.json();
	if (!book || chapter == null || verse == null) return error(400);

	const mark = await prisma.mark.upsert({
		where: {
			userId_book_chapter_verse: {
				userId: session.user.id,
				book,
				chapter: parseInt(chapter),
				verse: parseInt(verse)
			}
		},
		update: {
			...(color != null && { color }),
			...(comment !== undefined && { comment })
		},
		create: {
			userId: session.user.id,
			book,
			chapter: parseInt(chapter),
			verse: parseInt(verse),
			color: color ?? '#FFD700',
			comment: comment ?? null
		}
	});

	return json(mark);
};

export const DELETE: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) return error(401);

	const { book, chapter, verse } = await event.request.json();
	if (!book || chapter == null || verse == null) return error(400);

	await prisma.mark.deleteMany({
		where: {
			userId: session.user.id,
			book,
			chapter: parseInt(chapter),
			verse: parseInt(verse)
		}
	});

	return json({ ok: true });
};
