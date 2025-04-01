import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';

export async function GET() {
    const users = await db.select().from(user);
    return json(users);
}

export async function POST({ request }) {
    const { user_name, user_age, bio } = await request.json();
    const newUser = await db.insert(user).values({
        user_name,
        user_age,
        bio
    }).returning();
    return json(newUser[0]);
}