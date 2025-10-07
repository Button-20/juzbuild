import type { Db } from "mongodb";
import { MongoClient } from "mongodb";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/real-estate";

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}
let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;
let cachedDbName: string | null = null;

async function connectDB() {
  if (cachedClient && cachedDb && cachedDbName) {
    return {
      client: cachedClient,
      db: cachedDb,
      dbName: cachedDbName,
    };
  }

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const dbName = MONGODB_URI.split("/").pop() || "real-estate";
  const db = client.db(dbName);
  cachedClient = client;
  cachedDb = db;
  cachedDbName = dbName;
  return { client, db, dbName };
}

export default connectDB;
