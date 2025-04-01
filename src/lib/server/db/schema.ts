import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const user = sqliteTable('user', {
	user_id: integer('user_id').primaryKey(),
	user_name: text('user_name').notNull(),
	user_age: integer('user_age'),
	bio: text('bio')
});