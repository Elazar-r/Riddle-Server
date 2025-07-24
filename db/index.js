import { MongoClient, ObjectId } from "mongodb";
import { config } from "dotenv";

config({
    quiet: true,
});

const mongoUrl = process.env.mongo_url;
if (!mongoUrl) { throw new Error("Environment variable 'mongo_url' must be defined") }

console.log(`******* Connecting to MongoDB at ${mongoUrl}`);
export const client = new MongoClient(mongoUrl);

// export async function connectDatabase() {
//     await client.connect();
//     console.log("Connected to MongoDB");
//     return client;
// }

// export async function insertDocument(client: any, collection: string, document: object) {
//     const db = client.db('dbuser');
//     const result = await db.collection(collection).insertOne(document);
//     return result;
// }

export async function getAllDocuments(collection) {
    const db = client.db('db');
    const documents = await db.collection(collection).find({}).toArray();
    
    return documents;
}
