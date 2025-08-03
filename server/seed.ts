import { db } from "./db";
import { lifeEvents } from "@shared/schema";

const sampleLifeEvents = [
  // Formative Years
  {
    title: "Moved out at 17",
    description: "Left home early and learned independence",
    category: "formative",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Parents divorced when I was young",
    description: "Experienced family separation during childhood",
    category: "formative",
    isTemplate: true,
    isSensitive: true,
  },
  {
    title: "Was the only [identity] kid in my school",
    description: "Experienced being different from peers",
    category: "formative",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Raised by a single parent",
    description: "Grew up in a single-parent household",
    category: "formative",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Lived abroad and felt alone",
    description: "Experienced isolation while living in a foreign country",
    category: "formative",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Changed schools frequently",
    description: "Had to adapt to new environments regularly",
    category: "formative",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Lost a parent young",
    description: "Experienced the loss of a parent during childhood or teens",
    category: "formative",
    isTemplate: true,
    isSensitive: true,
  },
  {
    title: "Grew up in poverty",
    description: "Experienced financial hardship during childhood",
    category: "formative",
    isTemplate: true,
    isSensitive: false,
  },

  // Turning Points
  {
    title: "Went through a major friend breakup",
    description: "Lost an important friendship that changed your perspective",
    category: "turning_points",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Career pivot at 25+",
    description: "Made a significant career change in your twenties or later",
    category: "turning_points",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Overcame a serious illness",
    description: "Faced and recovered from a significant health challenge",
    category: "turning_points",
    isTemplate: true,
    isSensitive: true,
  },
  {
    title: "Left a toxic relationship",
    description: "Ended an unhealthy romantic relationship",
    category: "turning_points",
    isTemplate: true,
    isSensitive: true,
  },
  {
    title: "Dropped out of college",
    description: "Left formal education to pursue other paths",
    category: "turning_points",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Started my own business",
    description: "Became an entrepreneur and started a company",
    category: "turning_points",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Went through therapy",
    description: "Sought professional help for mental health",
    category: "turning_points",
    isTemplate: true,
    isSensitive: true,
  },
  {
    title: "Had a spiritual awakening",
    description: "Experienced a significant shift in spiritual beliefs",
    category: "turning_points",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Lived in a different country",
    description: "Moved abroad and experienced culture shock",
    category: "turning_points",
    isTemplate: true,
    isSensitive: false,
  },

  // Growth
  {
    title: "Learning to be vulnerable in relationships",
    description: "Working on opening up emotionally with partners",
    category: "growth",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Spent a year single on purpose",
    description: "Intentionally focused on self-discovery while single",
    category: "growth",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Developing boundaries with family",
    description: "Learning to set healthy limits with family members",
    category: "growth",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Overcoming imposter syndrome",
    description: "Working through feelings of inadequacy in professional life",
    category: "growth",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Learning to manage anxiety",
    description: "Developing coping strategies for anxiety",
    category: "growth",
    isTemplate: true,
    isSensitive: true,
  },
  {
    title: "Building confidence after failure",
    description: "Recovering from a major setback or failure",
    category: "growth",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Finding work-life balance",
    description: "Learning to prioritize personal time and relationships",
    category: "growth",
    isTemplate: true,
    isSensitive: false,
  },
  {
    title: "Embracing being childfree/childless",
    description: "Coming to terms with not having children",
    category: "growth",
    isTemplate: true,
    isSensitive: false,
  },
];

export async function seedDatabase() {
  try {
    console.log("🌱 Seeding database with life events...");
    
    // Insert life events
    for (const event of sampleLifeEvents) {
      await db.insert(lifeEvents).values(event).onConflictDoNothing();
    }
    
    console.log(`✅ Seeded ${sampleLifeEvents.length} life events`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase().then(() => {
    console.log("Database seeding complete!");
    process.exit(0);
  }).catch((error) => {
    console.error("Database seeding failed:", error);
    process.exit(1);
  });
}