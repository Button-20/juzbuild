// Client-safe MongoDB utilities for Next.js
// Prevents MongoDB from being bundled in client-side code

let getDatabase: (dbName?: string) => Promise<any>;
let getCollection: (name: string, db?: string) => Promise<any>;

// Database initialization state management
let isInitialized = false;
let initializationPromise: Promise<void> | null = null;

if (typeof window === "undefined") {
  // Server-side: initialize MongoDB connection
  const { Db, MongoClient } = require("mongodb");

  if (!process.env.MONGODB_URI) {
    throw new Error("Please add your MongoDB URI to .env.local");
  }

  const uri = process.env.MONGODB_URI;
  const options = {};

  let client: any;
  let clientPromise: Promise<any>;

  if (process.env.NODE_ENV === "development") {
    // Preserve connection across hot reloads in development
    if (!(global as any)._mongoClientPromise) {
      client = new MongoClient(uri, options);
      (global as any)._mongoClientPromise = client.connect();
    }
    clientPromise = (global as any)._mongoClientPromise;
  } else {
    // Production: create new connection
    client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  getDatabase = async (dbName: string = "Juzbuild") => {
    const client = await clientPromise;
    const db = client.db(dbName);

    // Initialize database indexes on first connection (with race condition protection)
    if (!isInitialized && !initializationPromise) {
      initializationPromise = initializeDatabase(db)
        .then(() => {
          isInitialized = true;
        })
        .catch((error) => {
          initializationPromise = null; // Allow retry on next connection
          // Don't throw error to avoid breaking the app
        });
    }

    // Wait for initialization if it's in progress
    if (initializationPromise && !isInitialized) {
      await initializationPromise;
    }

    return db;
  };
  getCollection = async (
    collectionName: string,
    dbName: string = "Juzbuild"
  ) => {
    const db = await getDatabase(dbName);
    return db.collection(collectionName);
  };
} else {
  // Client-side: provide error stubs
  getDatabase = () =>
    Promise.reject(
      new Error("Database operations are not available on the client side")
    );
  getCollection = () =>
    Promise.reject(
      new Error("Database operations are not available on the client side")
    );
}

/**
 * Initialize database indexes and constraints
 * This is called automatically on first database connection
 */
async function initializeDatabase(db: any): Promise<void> {
  try {
    // Initialize collections sequentially to avoid conflicts
    await initializeUsersCollection(db);
    await initializeOnboardingCollection(db);
  } catch (error) {
    throw error;
  }
}

/**
 * Initialize users collection with proper indexes
 */
async function initializeUsersCollection(db: any): Promise<void> {
  const usersCollection = db.collection("users");

  try {
    // Create unique index on email field
    await usersCollection.createIndex(
      { email: 1 },
      {
        unique: true,
        name: "unique_email_index",
        background: true,
      }
    );

    // Create index on domainName for faster lookups
    await usersCollection.createIndex(
      { domainName: 1 },
      {
        name: "domain_name_index",
        background: true,
      }
    );

    // Create compound index on email and isActive for authentication queries
    await usersCollection.createIndex(
      { email: 1, isActive: 1 },
      {
        name: "email_active_index",
        background: true,
      }
    );

    // Create index on createdAt for sorting
    await usersCollection.createIndex(
      { createdAt: -1 },
      {
        name: "created_at_index",
        background: true,
      }
    );
  } catch (error: any) {
    // Handle duplicate key errors gracefully (indexes already exist)
    if (error.code !== 11000) {
      throw error;
    }
  }
}

/**
 * Initialize onboarding collection with proper indexes
 */
async function initializeOnboardingCollection(db: any): Promise<void> {
  const onboardingCollection = db.collection("onboarding");

  try {
    // Create index on userId for fast lookups
    await onboardingCollection.createIndex(
      { userId: 1 },
      {
        name: "user_id_index",
        background: true,
      }
    );

    // Create index on status for filtering
    await onboardingCollection.createIndex(
      { status: 1 },
      {
        name: "status_index",
        background: true,
      }
    );

    // Create index on createdAt for sorting and cleanup
    await onboardingCollection.createIndex(
      { createdAt: -1 },
      {
        name: "created_at_index",
        background: true,
      }
    );
  } catch (error: any) {
    if (error.code !== 11000) {
      throw error;
    }
  }
}

/**
 * Get user's website database name from their domain
 */
export async function getUserDatabaseName(
  userId: string
): Promise<string | null> {
  try {
    const { toObjectId } = require("@/lib/auth");
    const usersCollection = await getCollection("users");
    const user = await usersCollection.findOne({ _id: toObjectId(userId) });

    if (user && user.domainName) {
      // Convert domain to database name format
      const websiteName = user.domainName
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
      return `juzbuild_${websiteName}`;
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get collection from user's specific database
 */
export async function getUserCollection(
  collectionName: string,
  userId: string
): Promise<any> {
  const userDatabaseName = await getUserDatabaseName(userId);

  if (!userDatabaseName) {
    // Fallback to main database if user doesn't have a specific database yet
    return await getCollection(collectionName);
  }

  return await getCollection(collectionName, userDatabaseName);
}

export { getCollection, getDatabase };
