import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { user } from '$lib/server/db/schema';
import { inArray } from 'drizzle-orm';
import { env } from '$env/dynamic/private';

import type { RequestEvent } from '@sveltejs/kit';

export async function POST({ request }: RequestEvent) {
    const { userIds,instructions } = await request.json();
    
    if (!userIds || userIds.length === 0) {
        return json({ error: 'No users selected' }, { status: 400 });
    }

    // Fetch selected users
    const users = await db.select().from(user).where(inArray(user.user_id, userIds));
    
    const names = users.map(u => u.user_name || 'No names provided').join('\n');
    const ages = users.map(u => u.user_age || 'No ages provided').join('\n');
    const bios = users.map(u => u.bio || 'No bio provided').join('\n');
    const prompt = `${instructions || 'Provide a concise summary of the following user information and a relevant connection between the users based on their bios, names, and ages.'}\n\nUser Data:\nBios:\n${bios}\nNames:\n${names}\nAges:\n${ages}`;

    // OpenRouter.ai integration
    const apiKey = env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not set');
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'deepseek/deepseek-r1',
            messages: [{ role: 'user', content: prompt }],
        }),
    });

    if (!response.ok) {
        throw new Error('Failed to fetch summary from OpenRouter.ai');
    }

    const result = await response.json();
    const summary = result.choices[0].message.content;
    return json({ summary });
}