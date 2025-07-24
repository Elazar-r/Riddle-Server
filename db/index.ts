import { MongoClient, ObjectId } from "mongodb";
const mongoUrl = process.env.mongo_url;
if (!mongoUrl) { throw new Error("Environment variable 'mongo_url' must be defined") }

export const client = new MongoClient(mongoUrl);

export async function connectDatabase() {
    await client.connect();
    console.log("Connected to MongoDB");
    return client;
}

export async function insertDocument(client: any, collection: string, document: object) {
    const db = client.db('dbuser');
    const result = await db.collection(collection).insertOne(document);
    return result;
}

export async function getAllDocuments(client: any, collection: string) {
    const db = client.db('dbuser');
    const documents = await db.collection(collection).find().toArray();
    return documents;
}
