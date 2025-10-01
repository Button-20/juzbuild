// Client-safe MongoDB utilities for Next.js
// Prevents MongoDB from being bundled in client-side code

let getDatabase: (dbName?: string) => Promise<any>;
let getCollection: (name: string, db?: string) => Promise<any>;

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
    return client.db(dbName);
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

export { getCollection, getDatabase };
