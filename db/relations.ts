import { relations } from "drizzle-orm/relations";
import { user, session, account, images, restaurants } from "./schema";

export const sessionRelations = relations(session, ({one}) => ({
	user: one(user, {
		fields: [session.userId],
		references: [user.id]
	}),
}));

export const userRelations = relations(user, ({many}) => ({
	sessions: many(session),
	accounts: many(account),
	images: many(images),
	restaurants: many(restaurants),
}));

export const accountRelations = relations(account, ({one}) => ({
	user: one(user, {
		fields: [account.userId],
		references: [user.id]
	}),
}));

export const imagesRelations = relations(images, ({one, many}) => ({
	user: one(user, {
		fields: [images.uploadedBy],
		references: [user.id]
	}),
	restaurants: many(restaurants),
}));

export const restaurantsRelations = relations(restaurants, ({one}) => ({
	user: one(user, {
		fields: [restaurants.ownerId],
		references: [user.id]
	}),
	image: one(images, {
		fields: [restaurants.logoImageId],
		references: [images.id]
	}),
}));