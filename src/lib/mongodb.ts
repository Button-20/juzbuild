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
      initializationPromise = initializeDatabase(db).then(() => {
        isInitialized = true;
        console.log("✅ Database initialization completed");
      }).catch((error) => {
        console.warn("⚠️ Database initialization failed:", error);
        initializationPromise = null; // Allow retry on next connection
        // Don't throw error to avoid breaking the app
      });
    }
    
    // Wait for initialization if it's in progress
    if (initializationPromise && !isInitialized) {
      await initializationPromise;
    }
    
    return db;
  };  getCollection = async (
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
    console.log("Initializing database indexes...");

    // Initialize collections sequentially to avoid conflicts
    await initializeUsersCollection(db);
    await initializePropertiesCollection(db);
    await initializePropertyTypesCollection(db);
    await initializeOnboardingCollection(db);

    console.log("Database initialization completed successfully");
  } catch (error) {
    console.error("Database initialization failed:", error);
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
    console.log("✅ Created unique index on users.email");

    // Create index on domainName for faster lookups
    await usersCollection.createIndex(
      { domainName: 1 },
      {
        name: "domain_name_index",
        background: true,
      }
    );
    console.log("✅ Created index on users.domainName");

    // Create compound index on email and isActive for authentication queries
    await usersCollection.createIndex(
      { email: 1, isActive: 1 },
      {
        name: "email_active_index",
        background: true,
      }
    );
    console.log("✅ Created compound index on users.email and users.isActive");

    // Create index on createdAt for sorting
    await usersCollection.createIndex(
      { createdAt: -1 },
      {
        name: "created_at_index",
        background: true,
      }
    );
    console.log("✅ Created index on users.createdAt");
  } catch (error: any) {
    // Handle duplicate key errors gracefully (indexes already exist)
    if (error.code === 11000) {
      console.log("ℹ️ Users collection indexes already exist");
    } else {
      console.error("Error creating users indexes:", error);
      throw error;
    }
  }
}

/**
 * Initialize properties collection with proper indexes
 */
async function initializePropertiesCollection(db: any): Promise<void> {
  const propertiesCollection = db.collection("properties");

  try {
    // Create compound index on userId and domain for user data isolation
    await propertiesCollection.createIndex(
      { userId: 1, domain: 1 },
      {
        name: "user_domain_index",
        background: true,
      }
    );
    console.log("✅ Created compound index on properties.userId and properties.domain");

    // Create index on slug for fast property lookups
    await propertiesCollection.createIndex(
      { slug: 1, domain: 1 },
      {
        name: "slug_domain_index",
        background: true,
      }
    );
    console.log("✅ Created compound index on properties.slug and properties.domain");

    // Create index on status and isActive for filtering
    await propertiesCollection.createIndex(
      { status: 1, isActive: 1 },
      {
        name: "status_active_index",
        background: true,
      }
    );
    console.log("✅ Created compound index on properties.status and properties.isActive");

    // Create text index for search functionality
    await propertiesCollection.createIndex(
      {
        name: "text",
        description: "text",
        location: "text",
      },
      {
        name: "search_text_index",
        background: true,
      }
    );
    console.log("✅ Created text search index on properties");

    // Create index on createdAt for sorting
    await propertiesCollection.createIndex(
      { createdAt: -1 },
      {
        name: "created_at_index",
        background: true,
      }
    );
    console.log("✅ Created index on properties.createdAt");
  } catch (error: any) {
    if (error.code === 11000) {
      console.log("ℹ️ Properties collection indexes already exist");
    } else {
      console.error("Error creating properties indexes:", error);
      throw error;
    }
  }
}

/**
 * Initialize property types collection with proper indexes
 */
async function initializePropertyTypesCollection(db: any): Promise<void> {
  const propertyTypesCollection = db.collection("propertyTypes");

  try {
    // Create unique compound index on slug (global types have null userId)
    await propertyTypesCollection.createIndex(
      { slug: 1, userId: 1 },
      {
        name: "slug_user_index",
        background: true,
        sparse: true, // Allow null userId for global types
      }
    );
    console.log("✅ Created compound index on propertyTypes.slug and propertyTypes.userId");

    // Create index on isActive for filtering
    await propertyTypesCollection.createIndex(
      { isActive: 1 },
      {
        name: "active_index",
        background: true,
      }
    );
    console.log("✅ Created index on propertyTypes.isActive");
  } catch (error: any) {
    if (error.code === 11000) {
      console.log("ℹ️ Property types collection indexes already exist");
    } else {
      console.error("Error creating property types indexes:", error);
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
    console.log("✅ Created index on onboarding.userId");

    // Create index on status for filtering
    await onboardingCollection.createIndex(
      { status: 1 },
      {
        name: "status_index",
        background: true,
      }
    );
    console.log("✅ Created index on onboarding.status");

    // Create index on createdAt for sorting and cleanup
    await onboardingCollection.createIndex(
      { createdAt: -1 },
      {
        name: "created_at_index",
        background: true,
      }
    );
    console.log("✅ Created index on onboarding.createdAt");
  } catch (error: any) {
    if (error.code === 11000) {
      console.log("ℹ️ Onboarding collection indexes already exist");
    } else {
      console.error("Error creating onboarding indexes:", error);
      throw error;
    }
  }
}

export { getCollection, getDatabase };
