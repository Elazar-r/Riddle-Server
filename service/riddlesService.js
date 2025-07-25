import { getAllDocuments } from "../db/mongo.js";

export const getRiddles = async () => {
    return await getAllDocuments("riddles");
};