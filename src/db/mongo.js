import { MongoClient, ObjectId } from "mongodb";
import { config } from "dotenv";

config({ quiet: true });

const mongoUrl = process.env.mongo_url;
if (!mongoUrl) { throw new Error("Environment variable 'mongo_url' must be defined") }

const client = new MongoClient(mongoUrl);


export async function insertDocument(collection, document) {
    const db = client.db('dbuser');
    return await db.collection(collection).insertOne(document);
}

export async function getAllDocuments(collection) {
    const db = client.db('db');
    return await db.collection(collection).find({}).toArray();
}
