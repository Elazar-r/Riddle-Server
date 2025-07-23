// 'use client';
import { MongoClient, ObjectId } from "mongodb";


export async function connectDatabase() {
    const dbConnection: any = process.env.PUBLIC_DB_CONNECTION;
    return await MongoClient.connect(dbConnection);
}

export async function insertDocument(client: any, collection: string, document: object) {
    const db = client.db('dbuser');
    const result = await db.collection(collection).insertOne(document);
    return result;
}
