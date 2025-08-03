import {
  users,
  lifeEvents,
  userLifeEvents,
  userPhotos,
  matches,
  sharedEvents,
  conversationStarters,
  messages,
  type User,
  type UpsertUser,
  type LifeEvent,
  type InsertLifeEvent,
  type UserLifeEvent,
  type InsertUserLifeEvent,
  type UserPhoto,
  type InsertUserPhoto,
  type Match,
  type InsertMatch,
  type SharedEvent,
  type ConversationStarter,
  type Message,
  type InsertMessage,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, asc, sql, inArray } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;

  // Life events operations
  getLifeEventTemplates(): Promise<LifeEvent[]>;
  createLifeEvent(lifeEvent: InsertLifeEvent): Promise<LifeEvent>;
  getUserLifeEvents(userId: string): Promise<UserLifeEvent[]>;
  createUserLifeEvent(userLifeEvent: InsertUserLifeEvent): Promise<UserLifeEvent>;
  updateUserLifeEvent(id: string, updates: Partial<UserLifeEvent>): Promise<UserLifeEvent>;
  deleteUserLifeEvent(id: string): Promise<void>;

  // Matching operations
  findPotentialMatches(userId: string): Promise<User[]>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatchAction(matchId: string, userId: string, action: string): Promise<Match>;
  getUserMatches(userId: string): Promise<Match[]>;
  getMatchById(id: string): Promise<Match | undefined>;
  getMatchByUsers(user1Id: string, user2Id: string): Promise<Match | undefined>;

  // User photo operations
  getUserPhotos(userId: string): Promise<UserPhoto[]>;
  addUserPhoto(photo: InsertUserPhoto): Promise<UserPhoto>;
  updateUserPhoto(photoId: string, updates: Partial<UserPhoto>): Promise<UserPhoto>;
  deleteUserPhoto(photoId: string): Promise<void>;
  setPrimaryPhoto(userId: string, photoId: string): Promise<void>;

  // Shared events operations
  getSharedEventsForMatch(matchId: string): Promise<SharedEvent[]>;
  createSharedEvent(sharedEvent: Omit<SharedEvent, 'id' | 'createdAt'>): Promise<SharedEvent>;

  // Conversation starters
  getConversationStarters(matchId: string): Promise<ConversationStarter[]>;
  createConversationStarter(starter: Omit<ConversationStarter, 'id' | 'createdAt'>): Promise<ConversationStarter>;

  // Messages
  getMatchMessages(matchId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Life events operations
  async getLifeEventTemplates(): Promise<LifeEvent[]> {
    return await db
      .select()
      .from(lifeEvents)
      .where(eq(lifeEvents.isTemplate, true))
      .orderBy(asc(lifeEvents.category), asc(lifeEvents.title));
  }

  async createLifeEvent(lifeEvent: InsertLifeEvent): Promise<LifeEvent> {
    const [newEvent] = await db
      .insert(lifeEvents)
      .values(lifeEvent)
      .returning();
    return newEvent;
  }

  async getUserLifeEvents(userId: string): Promise<UserLifeEvent[]> {
    return await db
      .select()
      .from(userLifeEvents)
      .where(eq(userLifeEvents.userId, userId))
      .orderBy(asc(userLifeEvents.ageWhenHappened));
  }

  async createUserLifeEvent(userLifeEvent: InsertUserLifeEvent): Promise<UserLifeEvent> {
    const [newEvent] = await db
      .insert(userLifeEvents)
      .values(userLifeEvent)
      .returning();
    return newEvent;
  }

  async updateUserLifeEvent(id: string, updates: Partial<UserLifeEvent>): Promise<UserLifeEvent> {
    const [updated] = await db
      .update(userLifeEvents)
      .set(updates)
      .where(eq(userLifeEvents.id, id))
      .returning();
    return updated;
  }

  async deleteUserLifeEvent(id: string): Promise<void> {
    await db.delete(userLifeEvents).where(eq(userLifeEvents.id, id));
  }

  // Matching operations
  async findPotentialMatches(userId: string): Promise<User[]> {
    // Get current user's preferences
    const currentUser = await this.getUser(userId);
    if (!currentUser) return [];

    // Get users who already have matches or actions with the current user
    const existingMatches = db
      .select({ userId: matches.user2Id })
      .from(matches)
      .where(eq(matches.user1Id, userId))
      .union(
        db
          .select({ userId: matches.user1Id })
          .from(matches)
          .where(eq(matches.user2Id, userId))
      );

    // Build gender filter conditions
    const genderConditions: any[] = [
      eq(users.onboardingCompleted, true),
      sql`${users.id} != ${userId}`,
      sql`${users.id} NOT IN (${existingMatches})`
    ];

    // Add gender preference filtering
    if (currentUser.genderPreference && currentUser.genderPreference !== 'everyone') {
      const preferredGender = currentUser.genderPreference === 'men' ? 'man' : 'woman';
      genderConditions.push(eq(users.gender, preferredGender));
    }

    return await db
      .select()
      .from(users)
      .where(and(...genderConditions))
      .limit(10);
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db
      .insert(matches)
      .values(match)
      .returning();
    return newMatch;
  }

  async updateMatchAction(matchId: string, userId: string, action: string): Promise<Match> {
    // Determine which user action to update
    const match = await this.getMatchById(matchId);
    if (!match) throw new Error('Match not found');

    const updates = match.user1Id === userId 
      ? { user1Action: action }
      : { user2Action: action };

    const [updated] = await db
      .update(matches)
      .set(updates)
      .where(eq(matches.id, matchId))
      .returning();
    return updated;
  }

  async getUserMatches(userId: string): Promise<Match[]> {
    return await db
      .select()
      .from(matches)
      .where(
        and(
          or(eq(matches.user1Id, userId), eq(matches.user2Id, userId)),
          or(eq(matches.user1Action, 'relate'), eq(matches.user2Action, 'relate'))
        )
      )
      .orderBy(desc(matches.createdAt));
  }

  async getMatchById(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match;
  }

  async getMatchByUsers(user1Id: string, user2Id: string): Promise<Match | undefined> {
    const [match] = await db
      .select()
      .from(matches)
      .where(
        or(
          and(eq(matches.user1Id, user1Id), eq(matches.user2Id, user2Id)),
          and(eq(matches.user1Id, user2Id), eq(matches.user2Id, user1Id))
        )
      );
    return match;
  }

  // Shared events operations
  async getSharedEventsForMatch(matchId: string): Promise<SharedEvent[]> {
    return await db
      .select()
      .from(sharedEvents)
      .where(eq(sharedEvents.matchId, matchId));
  }

  async createSharedEvent(sharedEvent: Omit<SharedEvent, 'id' | 'createdAt'>): Promise<SharedEvent> {
    const [newSharedEvent] = await db
      .insert(sharedEvents)
      .values(sharedEvent)
      .returning();
    return newSharedEvent;
  }

  // Conversation starters
  async getConversationStarters(matchId: string): Promise<ConversationStarter[]> {
    return await db
      .select()
      .from(conversationStarters)
      .where(eq(conversationStarters.matchId, matchId))
      .orderBy(asc(conversationStarters.createdAt));
  }

  async createConversationStarter(starter: Omit<ConversationStarter, 'id' | 'createdAt'>): Promise<ConversationStarter> {
    const [newStarter] = await db
      .insert(conversationStarters)
      .values(starter)
      .returning();
    return newStarter;
  }

  // Messages
  async getMatchMessages(matchId: string): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.matchId, matchId))
      .orderBy(asc(messages.createdAt));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db
      .insert(messages)
      .values(message)
      .returning();
    return newMessage;
  }

  // User photo operations
  async getUserPhotos(userId: string): Promise<UserPhoto[]> {
    return await db
      .select()
      .from(userPhotos)
      .where(eq(userPhotos.userId, userId))
      .orderBy(desc(userPhotos.isPrimary), asc(userPhotos.displayOrder));
  }

  async addUserPhoto(photo: InsertUserPhoto): Promise<UserPhoto> {
    const [newPhoto] = await db
      .insert(userPhotos)
      .values(photo)
      .returning();
    return newPhoto;
  }

  async updateUserPhoto(photoId: string, updates: Partial<UserPhoto>): Promise<UserPhoto> {
    const [updated] = await db
      .update(userPhotos)
      .set(updates)
      .where(eq(userPhotos.id, photoId))
      .returning();
    return updated;
  }

  async deleteUserPhoto(photoId: string): Promise<void> {
    await db.delete(userPhotos).where(eq(userPhotos.id, photoId));
  }

  async setPrimaryPhoto(userId: string, photoId: string): Promise<void> {
    // First, set all photos for this user to not primary
    await db
      .update(userPhotos)
      .set({ isPrimary: false })
      .where(eq(userPhotos.userId, userId));
    
    // Then set the specified photo as primary
    await db
      .update(userPhotos)
      .set({ isPrimary: true })
      .where(eq(userPhotos.id, photoId));
  }
}

export const storage = new DatabaseStorage();
