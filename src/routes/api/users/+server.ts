import {db} from '$lib/server/db'; //database connection
import {user} from '$lib/server/db/schema'; //user table connection
import {json} from '@sveltejs/kit'; //json response

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    const data = await db.select().from(user);

    return json ({data: data});
};

export const POST: RequestHandler = async ({request}) => {
    const {user_name, user_age, bio} = await request.json();

    const query = await db.insert(user).values({
        user_name: user_name,
        user_age: user_age,
        bio: bio
    });

    return json({success: true});
};