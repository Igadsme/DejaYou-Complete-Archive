import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertUserLifeEventSchema, insertUserPhotoSchema, insertMessageSchema, matches } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile
  app.patch('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      const user = await storage.upsertUser({ id: userId, ...updates });
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Get life event templates
  app.get('/api/life-events/templates', async (req, res) => {
    try {
      const templates = await storage.getLifeEventTemplates();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching life event templates:", error);
      res.status(500).json({ message: "Failed to fetch life event templates" });
    }
  });

  // Get user's life events
  app.get('/api/user/life-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const events = await storage.getUserLifeEvents(userId);
      res.json(events);
    } catch (error) {
      console.error("Error fetching user life events:", error);
      res.status(500).json({ message: "Failed to fetch life events" });
    }
  });

  // Create user life event
  app.post('/api/user/life-events', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const eventData = insertUserLifeEventSchema.parse({
        ...req.body,
        userId,
      });
      
      const event = await storage.createUserLifeEvent(eventData);
      res.json(event);
    } catch (error) {
      console.error("Error creating life event:", error);
      res.status(500).json({ message: "Failed to create life event" });
    }
  });

  // Update user life event
  app.patch('/api/user/life-events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const event = await storage.updateUserLifeEvent(id, updates);
      res.json(event);
    } catch (error) {
      console.error("Error updating life event:", error);
      res.status(500).json({ message: "Failed to update life event" });
    }
  });

  // Delete user life event
  app.delete('/api/user/life-events/:id', isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteUserLifeEvent(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting life event:", error);
      res.status(500).json({ message: "Failed to delete life event" });
    }
  });

  // User photo routes
  // Get user photos
  app.get('/api/user/photos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photos = await storage.getUserPhotos(userId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching user photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Add user photo
  app.post('/api/user/photos', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photoData = insertUserPhotoSchema.parse({
        ...req.body,
        userId,
      });
      
      const photo = await storage.addUserPhoto(photoData);
      res.json(photo);
    } catch (error) {
      console.error("Error adding photo:", error);
      res.status(500).json({ message: "Failed to add photo" });
    }
  });

  // Update user photo
  app.patch('/api/user/photos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const photoId = req.params.id;
      const photo = await storage.updateUserPhoto(photoId, req.body);
      res.json(photo);
    } catch (error) {
      console.error("Error updating photo:", error);
      res.status(500).json({ message: "Failed to update photo" });
    }
  });

  // Delete user photo
  app.delete('/api/user/photos/:id', isAuthenticated, async (req: any, res) => {
    try {
      const photoId = req.params.id;
      await storage.deleteUserPhoto(photoId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Set primary photo
  app.patch('/api/user/photos/:id/primary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const photoId = req.params.id;
      await storage.setPrimaryPhoto(userId, photoId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting primary photo:", error);
      res.status(500).json({ message: "Failed to set primary photo" });
    }
  });

  // Get photos for a specific user (for viewing other profiles)
  app.get('/api/user/photos/:userId', isAuthenticated, async (req: any, res) => {
    try {
      const { userId } = req.params;
      const photos = await storage.getUserPhotos(userId);
      res.json(photos);
    } catch (error) {
      console.error("Error fetching user photos:", error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Find potential matches
  app.get('/api/matches/potential', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const potentialMatches = await storage.findPotentialMatches(userId);
      
      // Calculate DejaScore for each potential match
      const userEvents = await storage.getUserLifeEvents(userId);
      const matchesWithScores = await Promise.all(
        potentialMatches.map(async (potentialMatch) => {
          const matchEvents = await storage.getUserLifeEvents(potentialMatch.id);
          const dejaScore = calculateDejaScore(userEvents, matchEvents);
          
          return {
            ...potentialMatch,
            dejaScore,
            lifeEvents: matchEvents,
          };
        })
      );
      
      // Sort by DejaScore descending
      matchesWithScores.sort((a, b) => b.dejaScore - a.dejaScore);
      
      res.json(matchesWithScores);
    } catch (error) {
      console.error("Error finding potential matches:", error);
      res.status(500).json({ message: "Failed to find potential matches" });
    }
  });

  // Create match action (relate, curious, pass)
  app.post('/api/matches/:userId/action', isAuthenticated, async (req: any, res) => {
    try {
      const currentUserId = req.user.claims.sub;
      const { userId: targetUserId } = req.params;
      const { action } = req.body; // "relate", "curious", "pass"
      
      if (!['relate', 'curious', 'pass'].includes(action)) {
        return res.status(400).json({ message: "Invalid action" });
      }
      
      // Check if match already exists between these two users
      let match = await storage.getMatchByUsers(currentUserId, targetUserId);
      
      if (!match) {
        // Don't create matches for "pass" actions
        if (action === 'pass') {
          return res.json({ success: true, action: 'pass' });
        }
        
        // Calculate DejaScore for new matches
        const userEvents = await storage.getUserLifeEvents(currentUserId);
        const targetEvents = await storage.getUserLifeEvents(targetUserId);
        const dejaScore = calculateDejaScore(userEvents, targetEvents);
        
        // Create new match record
        match = await storage.createMatch({
          user1Id: currentUserId,
          user2Id: targetUserId,
          dejaScore,
          sharedEventsCount: findSharedEventCount(userEvents, targetEvents),
          user1Action: action,
          user2Action: null,
        });
        
        // For "relate" actions, immediately create shared events and conversation starters
        if (action === 'relate') {
          await createSharedEventsAndStarters(match.id, userEvents, targetEvents);
          match.isRevealed = true;
          await storage.updateMatchAction(match.id, currentUserId, action);
        }
      } else {
        // Update existing match with new action
        match = await storage.updateMatchAction(match.id, currentUserId, action);
        
        // Check for mutual interest after update
        const bothCurious = (match.user1Action === 'curious' && match.user2Action === 'curious');
        const bothRelate = (match.user1Action === 'relate' && match.user2Action === 'relate');
        const oneRelateOneCurious = (
          (match.user1Action === 'relate' && match.user2Action === 'curious') ||
          (match.user1Action === 'curious' && match.user2Action === 'relate')
        );
        
        // Create shared events and starters for mutual connections
        if ((bothCurious || bothRelate || oneRelateOneCurious) && !match.isRevealed) {
          const userEvents = await storage.getUserLifeEvents(currentUserId);
          const targetEvents = await storage.getUserLifeEvents(targetUserId);
          await createSharedEventsAndStarters(match.id, userEvents, targetEvents);
          
          // Mark match as revealed (shared chapters unlocked)
          await db.update(matches).set({ isRevealed: true }).where(eq(matches.id, match.id));
          match.isRevealed = true;
        }
      }
      
      res.json(match);
    } catch (error) {
      console.error("Error creating match action:", error);
      res.status(500).json({ message: "Failed to create match action" });
    }
  });

  // Get user matches
  app.get('/api/matches', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const matches = await storage.getUserMatches(userId);
      
      // Get additional user info for each match
      const matchesWithUserInfo = await Promise.all(
        matches.map(async (match) => {
          const otherUserId = match.user1Id === userId ? match.user2Id : match.user1Id;
          const otherUser = await storage.getUser(otherUserId);
          const sharedEvents = await storage.getSharedEventsForMatch(match.id);
          
          return {
            ...match,
            otherUser,
            sharedEventsCount: sharedEvents.length,
          };
        })
      );
      
      res.json(matchesWithUserInfo);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Get shared events for a match
  app.get('/api/matches/:matchId/shared-events', isAuthenticated, async (req: any, res) => {
    try {
      const { matchId } = req.params;
      const sharedEvents = await storage.getSharedEventsForMatch(matchId);
      res.json(sharedEvents);
    } catch (error) {
      console.error("Error fetching shared events:", error);
      res.status(500).json({ message: "Failed to fetch shared events" });
    }
  });

  // Get conversation starters for a match
  app.get('/api/matches/:matchId/conversation-starters', isAuthenticated, async (req: any, res) => {
    try {
      const { matchId } = req.params;
      const starters = await storage.getConversationStarters(matchId);
      res.json(starters);
    } catch (error) {
      console.error("Error fetching conversation starters:", error);
      res.status(500).json({ message: "Failed to fetch conversation starters" });
    }
  });

  // Get messages for a match
  app.get('/api/matches/:matchId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { matchId } = req.params;
      const messages = await storage.getMatchMessages(matchId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send message
  app.post('/api/matches/:matchId/messages', isAuthenticated, async (req: any, res) => {
    try {
      const { matchId } = req.params;
      const userId = req.user.claims.sub;
      const messageData = insertMessageSchema.parse({
        ...req.body,
        matchId,
        senderId: userId,
      });
      
      const message = await storage.createMessage(messageData);
      res.json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate DejaScore based on shared experiences
function calculateDejaScore(userEvents: any[], targetEvents: any[]): number {
  if (userEvents.length === 0 || targetEvents.length === 0) return 0;
  
  let sharedCount = 0;
  let totalWeight = 0;
  
  for (const userEvent of userEvents) {
    for (const targetEvent of targetEvents) {
      // Check for similar events based on category and keywords
      if (userEvent.category === targetEvent.category) {
        const similarity = calculateEventSimilarity(userEvent, targetEvent);
        if (similarity > 0.3) { // threshold for considering events similar
          sharedCount++;
          totalWeight += similarity;
        }
      }
    }
  }
  
  if (sharedCount === 0) return 0;
  
  // Calculate score based on shared events and their similarity
  const averageSimilarity = totalWeight / sharedCount;
  const eventCoverage = Math.min(sharedCount / Math.max(userEvents.length, targetEvents.length), 1);
  
  return Math.round(averageSimilarity * eventCoverage * 100);
}

// Helper function to calculate similarity between two events
function calculateEventSimilarity(event1: any, event2: any): number {
  let similarity = 0;
  
  // Same template event
  if (event1.lifeEventId && event1.lifeEventId === event2.lifeEventId) {
    similarity += 0.8;
  }
  
  // Similar custom titles
  if (event1.customTitle && event2.customTitle) {
    const titleSimilarity = getStringSimilarity(event1.customTitle, event2.customTitle);
    similarity += titleSimilarity * 0.6;
  }
  
  // Similar age when happened
  if (event1.ageWhenHappened && event2.ageWhenHappened) {
    const ageDiff = Math.abs(event1.ageWhenHappened - event2.ageWhenHappened);
    const ageScore = Math.max(0, 1 - ageDiff / 10); // within 10 years is considered similar
    similarity += ageScore * 0.3;
  }
  
  return Math.min(similarity, 1);
}

// Simple string similarity function
function getStringSimilarity(str1: string, str2: string): number {
  const words1 = str1.toLowerCase().split(/\s+/);
  const words2 = str2.toLowerCase().split(/\s+/);
  
  const intersection = words1.filter(word => words2.includes(word));
  const union = Array.from(new Set([...words1, ...words2]));
  
  return intersection.length / union.length;
}

// Helper function to count shared events
function findSharedEventCount(userEvents: any[], targetEvents: any[]): number {
  let count = 0;
  
  for (const userEvent of userEvents) {
    for (const targetEvent of targetEvents) {
      if (userEvent.category === targetEvent.category) {
        const similarity = calculateEventSimilarity(userEvent, targetEvent);
        if (similarity > 0.3) {
          count++;
          break; // Don't double count the same user event
        }
      }
    }
  }
  
  return count;
}

// Helper function to create shared events and conversation starters
async function createSharedEventsAndStarters(matchId: string, userEvents: any[], targetEvents: any[]) {
  const sharedEventPairs = [];
  
  for (const userEvent of userEvents) {
    for (const targetEvent of targetEvents) {
      if (userEvent.category === targetEvent.category) {
        const similarity = calculateEventSimilarity(userEvent, targetEvent);
        if (similarity > 0.3) {
          sharedEventPairs.push({
            userEvent,
            targetEvent,
            similarity: Math.round(similarity * 100),
          });
        }
      }
    }
  }
  
  // Create shared events
  for (const pair of sharedEventPairs) {
    await storage.createSharedEvent({
      matchId,
      user1EventId: pair.userEvent.id,
      user2EventId: pair.targetEvent.id,
      similarityScore: pair.similarity,
    });
  }
  
  // Create conversation starters based on shared events
  const conversationTemplates = [
    "Both of you have experienced {category}. What was the most challenging part of this experience?",
    "You both went through {category}. How did this shape your perspective on life?",
    "What did you learn about yourself during {category}?",
    "How did {category} change your relationships with others?",
    "What advice would you give to someone going through {category}?",
  ];
  
  const categories = Array.from(new Set(sharedEventPairs.map(pair => pair.userEvent.category)));
  
  for (const category of categories) {
    const template = conversationTemplates[Math.floor(Math.random() * conversationTemplates.length)];
    const question = template.replace('{category}', category.replace('_', ' '));
    
    await storage.createConversationStarter({
      matchId,
      question,
      basedOnEvent: category,
      isUsed: false,
    });
  }
}
