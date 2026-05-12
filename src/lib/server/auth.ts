import { SvelteKitAuth } from '@auth/sveltekit';
import { PrismaAdapter } from '@auth/prisma-adapter';
import type { Provider } from '@auth/sveltekit/providers';
import prisma from './db.js';

const providers: Provider[] = [];

if (process.env.OIDC_ISSUER_URL && process.env.OIDC_CLIENT_ID && process.env.OIDC_CLIENT_SECRET) {
	providers.push({
		id: 'authentik',
		name: 'Authentik',
		type: 'oidc',
		issuer: process.env.OIDC_ISSUER_URL,
		clientId: process.env.OIDC_CLIENT_ID,
		clientSecret: process.env.OIDC_CLIENT_SECRET
	});
}

export const { handle, signIn, signOut } = SvelteKitAuth({
	adapter: PrismaAdapter(prisma),
	providers,
	trustHost: true,
	callbacks: {
		session({ session, user }) {
			session.user.id = user.id;
			return session;
		}
	}
});
