import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler} from '@sveltejs/kit';

export const GET: RequestHandler = async () => {
    try {
        const users = await db.select().from(user);
        return json(users);
    } catch (error) {
        return json({ error: 'Failed to fetch users' }, { status: 500 });
    }
};


export const POST: RequestHandler = async ({ request }) => {
    try {
        const { user_name, user_age, bio } = await request.json();
        const [newUser] = await db.insert(user).values({
            user_name,
            user_age,
            bio
        }).returning();
        
        return json({ success: true, user: newUser }, { status: 201 });
    } catch (error) {
        return json({ error: 'Failed to add user' }, { status: 500 });
    }
};

// export const PUT: RequestHandler = async ({ request, params }) => {
//     try {
//         const { id } = params || {};
//         const { user_name, user_age, bio } = await request.json();
        
//         const [updatedUser] = await db.update(user)
//             .set({ user_name, user_age, bio })
//             .where(eq(user.user_id, id ? parseInt(id, 10) : NaN))
//             .returning();

//         if (!updatedUser) {
//             return json({ error: 'User not found' }, { status: 404 });
//         }

//         return json({ success: true, user: updatedUser });
//     } catch (error) {
//         return json({ error: 'Failed to update user' }, { status: 500 });
//     }
// };

// export const DELETE: RequestHandler = async ({ params }) => {
//     try {
//         const { id } = params;
//         const userId = id ? parseInt(id, 10) : undefined;

//         if (!userId) {
//             return json({ error: 'Invalid user ID' }, { status: 400 });
//         }

//         const [deletedUser] = await db.delete(user)
//             .where(eq(user.user_id, userId))
//             .returning();

//         if (!deletedUser) {
//             return json({ error: 'User not found' }, { status: 404 });
//         }

//         return json({ success: true });
//     } catch (error) {
//         return json({ error: 'Failed to delete user' }, { status: 500 });
//     }
// };