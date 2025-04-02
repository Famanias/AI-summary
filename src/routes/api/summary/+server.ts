import {db} from '$lib/server/db'; //database connection
import {user} from '$lib/server/db/schema'; //user table connection
import {json} from '@sveltejs/kit'; //json response

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
    const data = await db.select().from(user);

    //connect LLM 

    return json ({response: "The summary of this data is: "});
};