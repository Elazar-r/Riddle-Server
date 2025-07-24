import { getAllDocuments } from "../db/index.js";

export const getRiddles = async () => {
    console.log("Fservice: Fetching riddles from the database");
    return await getAllDocuments("riddles");
};