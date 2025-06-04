import { relations } from "drizzle-orm/relations";
import { user, session, account, restaurants } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	restaurants: many(restaurants),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const restaurantsRelations = relations(restaurants, ({one}) => ({
	user: one(user, {
		fields: [restaurants.ownerId],
		references: [user.id]
	}),
}));