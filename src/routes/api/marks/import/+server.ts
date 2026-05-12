import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import prisma from '$lib/server/db.js';

export const POST: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) return error(401);

	const data = await event.request.json();
	if (!data?.marks || !Array.isArray(data.marks)) return error(400);

	let imported = 0;
	for (const mark of data.marks) {
		if (!mark.book || mark.chapter == null || mark.verse == null) continue;

		await prisma.mark.upsert({
			where: {
				userId_book_chapter_verse: {
					userId: session.user.id,
					book: mark.book,
					chapter: mark.chapter,
					verse: mark.verse
				}
			},
			update: {
				color: mark.color ?? '#FFD700',
				comment: mark.comment ?? null
			},
			create: {
				userId: session.user.id,
				book: mark.book,
				chapter: mark.chapter,
				verse: mark.verse,
				color: mark.color ?? '#FFD700',
				comment: mark.comment ?? null
			}
		});
		imported++;
	}

	return json({ imported });
};
