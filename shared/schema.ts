import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  bio: text("bio"),
  age: integer("age"),
  location: varchar("location"),
  gender: varchar("gender", { length: 20 }), // "man", "woman", "non-binary"
  genderPreference: varchar("gender_preference", { length: 20 }), // "men", "women", "everyone"
  onboardingCompleted: boolean("onboarding_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Life events that users can select or create
export const lifeEvents = pgTable("life_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }), // "formative", "turning_points", "growth"
  isTemplate: boolean("is_template").default(true), // true for curated library, false for custom
  isSensitive: boolean("is_sensitive").default(false), // for emotional consent layer
  createdAt: timestamp("created_at").defaultNow(),
});

// User's personal timeline entries
export const userLifeEvents = pgTable("user_life_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  lifeEventId: uuid("life_event_id").references(() => lifeEvents.id),
  customTitle: varchar("custom_title", { length: 255 }),
  customDescription: text("custom_description"),
  personalStory: text("personal_story"), // how it shaped them
  ageWhenHappened: integer("age_when_happened"),
  category: varchar("category", { length: 100 }).notNull(),
  isSensitive: boolean("is_sensitive").default(false),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Matches between users
export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  user1Id: varchar("user1_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  user2Id: varchar("user2_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  dejaScore: integer("deja_score").notNull(), // 0-100 compatibility score
  sharedEventsCount: integer("shared_events_count").default(0),
  isRevealed: boolean("is_revealed").default(false), // if shared chapters are unlocked
  user1Action: varchar("user1_action", { length: 20 }), // "relate", "curious", "pass"
  user2Action: varchar("user2_action", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Shared life events between matched users
export const sharedEvents = pgTable("shared_events", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  user1EventId: uuid("user1_event_id").notNull().references(() => userLifeEvents.id),
  user2EventId: uuid("user2_event_id").notNull().references(() => userLifeEvents.id),
  similarityScore: integer("similarity_score").default(0), // how similar the events are
  createdAt: timestamp("created_at").defaultNow(),
});

// Conversation starters based on shared experiences
export const conversationStarters = pgTable("conversation_starters", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  question: text("question").notNull(),
  basedOnEvent: varchar("based_on_event", { length: 255 }),
  isUsed: boolean("is_used").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// User photos for profile galleries
export const userPhotos = pgTable("user_photos", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  imageUrl: varchar("image_url", { length: 500 }).notNull(),
  isPrimary: boolean("is_primary").default(false), // main profile photo
  displayOrder: integer("display_order").default(0), // order in photo gallery
  createdAt: timestamp("created_at").defaultNow(),
});

// Messages between matched users
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  matchId: uuid("match_id").notNull().references(() => matches.id, { onDelete: "cascade" }),
  senderId: varchar("sender_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  isConsentRequest: boolean("is_consent_request").default(false), // for sensitive content
  consentGranted: boolean("consent_granted"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  lifeEvents: many(userLifeEvents),
  photos: many(userPhotos),
  sentMatches: many(matches, { relationName: "user1Matches" }),
  receivedMatches: many(matches, { relationName: "user2Matches" }),
  sentMessages: many(messages),
}));

export const lifeEventsRelations = relations(lifeEvents, ({ many }) => ({
  userEvents: many(userLifeEvents),
}));

export const userLifeEventsRelations = relations(userLifeEvents, ({ one, many }) => ({
  user: one(users, {
    fields: [userLifeEvents.userId],
    references: [users.id],
  }),
  lifeEvent: one(lifeEvents, {
    fields: [userLifeEvents.lifeEventId],
    references: [lifeEvents.id],
  }),
  sharedAsUser1: many(sharedEvents, { relationName: "user1SharedEvents" }),
  sharedAsUser2: many(sharedEvents, { relationName: "user2SharedEvents" }),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  user1: one(users, {
    fields: [matches.user1Id],
    references: [users.id],
    relationName: "user1Matches",
  }),
  user2: one(users, {
    fields: [matches.user2Id],
    references: [users.id],
    relationName: "user2Matches",
  }),
  sharedEvents: many(sharedEvents),
  conversationStarters: many(conversationStarters),
  messages: many(messages),
}));

export const sharedEventsRelations = relations(sharedEvents, ({ one }) => ({
  match: one(matches, {
    fields: [sharedEvents.matchId],
    references: [matches.id],
  }),
  user1Event: one(userLifeEvents, {
    fields: [sharedEvents.user1EventId],
    references: [userLifeEvents.id],
    relationName: "user1SharedEvents",
  }),
  user2Event: one(userLifeEvents, {
    fields: [sharedEvents.user2EventId],
    references: [userLifeEvents.id],
    relationName: "user2SharedEvents",
  }),
}));

export const conversationStartersRelations = relations(conversationStarters, ({ one }) => ({
  match: one(matches, {
    fields: [conversationStarters.matchId],
    references: [matches.id],
  }),
}));

export const userPhotosRelations = relations(userPhotos, ({ one }) => ({
  user: one(users, {
    fields: [userPhotos.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  match: one(matches, {
    fields: [messages.matchId],
    references: [matches.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertLifeEventSchema = createInsertSchema(lifeEvents).omit({
  id: true,
  createdAt: true,
});

export const insertUserLifeEventSchema = createInsertSchema(userLifeEvents).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertUserPhotoSchema = createInsertSchema(userPhotos).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type LifeEvent = typeof lifeEvents.$inferSelect;
export type InsertLifeEvent = z.infer<typeof insertLifeEventSchema>;
export type UserLifeEvent = typeof userLifeEvents.$inferSelect;
export type InsertUserLifeEvent = z.infer<typeof insertUserLifeEventSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type SharedEvent = typeof sharedEvents.$inferSelect;
export type ConversationStarter = typeof conversationStarters.$inferSelect;
export type UserPhoto = typeof userPhotos.$inferSelect;
export type InsertUserPhoto = z.infer<typeof insertUserPhotoSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
