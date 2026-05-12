import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types.js';
import prisma from '$lib/server/db.js';

export const GET: RequestHandler = async (event) => {
	const session = await event.locals.auth();
	if (!session?.user?.id) return error(401);

	const marks = await prisma.mark.findMany({
		where: { userId: session.user.id },
		select: { book: true, chapter: true, verse: true, color: true, comment: true, createdAt: true },
		orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }]
	});

	const payload = {
		version: 1,
		exportedAt: new Date().toISOString(),
		marks
	};

	return json(payload, {
		headers: {
			'Content-Disposition': `attachment; filename="bible-marks-${new Date().toISOString().slice(0, 10)}.json"`
		}
	});
};
