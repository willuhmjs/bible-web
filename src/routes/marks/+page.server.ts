import { redirect } from '@sveltejs/kit';
import prisma from '$lib/server/db.js';
import type { PageServerLoad } from './$types.js';

export const load: PageServerLoad = async ({ locals }) => {
	const session = await locals.auth();
	if (!session?.user?.id) redirect(302, '/');

	const marks = await prisma.mark.findMany({
		where: { userId: session.user.id },
		orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }]
	});

	const grouped = new Map<string, typeof marks>();
	for (const mark of marks) {
		const key = `${mark.book}/${mark.chapter}`;
		if (!grouped.has(key)) grouped.set(key, []);
		grouped.get(key)!.push(mark);
	}

	return {
		marks,
		grouped: Object.fromEntries(grouped)
	};
};
