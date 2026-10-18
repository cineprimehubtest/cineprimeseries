import { MongoClient, Db } from "mongodb";
import dns from "dns";

// Fix Windows DNS issues for MongoDB SRV resolution
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch {
  // Ignore in environments where setServers is restricted
}

const uri = process.env.MONGODB_URI || "";
const dbName = process.env.MONGODB_DATABASE || "CinePrimeSeries";

interface GlobalWithMongo {
  _mongoClientPromise?: Promise<MongoClient>;
}

declare const global: GlobalWithMongo;

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;

if (uri) {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000,
        maxPoolSize: 10,
        family: 4,
      });
      global._mongoClientPromise = client.connect().catch((err) => {
        console.warn("[MongoDB] Initialization warning:", (err as Error).message);
        return client as MongoClient;
      });
    }
    clientPromise = global._mongoClientPromise;
  } else {
    client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      maxPoolSize: 20,
      family: 4,
    });
    clientPromise = client.connect().catch((err) => {
      console.warn("[MongoDB] Initialization warning:", (err as Error).message);
      return client as MongoClient;
    });
  }
}

export async function getDb(): Promise<Db | null> {
  if (!clientPromise) return null;
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  } catch (error) {
    console.warn("[MongoDB] Connection warning:", (error as Error).message);
    return null;
  }
}

export async function testMongoConnection(): Promise<{
  ok: boolean;
  message: string;
  database?: string;
  error?: string;
  tip?: string;
}> {
  if (!uri) {
    return {
      ok: false,
      message: "MONGODB_URI is not set in environment.",
      tip: "Add MONGODB_URI to your .env.local or Vercel Environment Variables.",
    };
  }

  try {
    const testClient = new MongoClient(uri, {
      serverSelectionTimeoutMS: 6000,
      connectTimeoutMS: 8000,
    });
    await testClient.connect();
    const admin = testClient.db().admin();
    const dbs = await admin.listDatabases();
    await testClient.close();
    return {
      ok: true,
      message: "Connected to MongoDB Atlas successfully!",
      database: dbName,
    };
  } catch (err: unknown) {
    const errMsg = (err as Error).message || String(err);
    let tip = "Check your MongoDB Atlas credentials and network connection.";
    if (errMsg.includes("tlsv1 alert internal error") || errMsg.includes("SSL alert number 80")) {
      tip = "Atlas IP Whitelist Required: Go to MongoDB Atlas -> Network Access -> Add IP Address -> Add '0.0.0.0/0' (Allow Access from Anywhere) or your current IP.";
    } else if (errMsg.includes("ECONNREFUSED") || errMsg.includes("querySrv")) {
      tip = "DNS SRV error. Ensure your network allows public DNS queries or use the standard non-SRV MongoDB replica set connection string.";
    } else if (errMsg.includes("Authentication failed")) {
      tip = "Invalid username or password in MONGODB_URI. Verify your Atlas Database Access user credentials.";
    }

    return {
      ok: false,
      message: "Failed to connect to MongoDB Atlas.",
      error: errMsg,
      tip,
    };
  }
}

export default clientPromise;
