import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ params }) => {
    try {
        const { id } = params;
        const userId = id ? parseInt(id, 10) : NaN;

        const [userData] = await db.select()
            .from(user)
            .where(eq(user.user_id, userId));

        if (!userData) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json(userData);
    } catch (error) {
        return json({ error: 'Failed to fetch user' }, { status: 500 });
    }
};

export const PUT: RequestHandler = async ({ request, params }) => {
    try {
        const { id } = params;
        const userId = id ? parseInt(id, 10) : NaN;
        const { user_name, user_age, bio } = await request.json();

        const [updatedUser] = await db.update(user)
            .set({ user_name, user_age, bio })
            .where(eq(user.user_id, userId))
            .returning();

        if (!updatedUser) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json({ success: true, user: updatedUser });
    } catch (error) {
        return json({ error: 'Failed to update user' }, { status: 500 });
    }
};

export const DELETE: RequestHandler = async ({ params }) => {
    try {
        const { id } = params;
        const userId = id ? parseInt(id, 10) : NaN;

        const [deletedUser] = await db.delete(user)
            .where(eq(user.user_id, userId))
            .returning();

        if (!deletedUser) {
            return json({ error: 'User not found' }, { status: 404 });
        }

        return json({ success: true });
    } catch (error) {
        return json({ error: 'Failed to delete user' }, { status: 500 });
    }
};