import express from "express";
import mongoService from "../db/index.js";

export default function config(app) {
    app.get("/", (req, res) => {

        // TODO: call the function to get the riddle list from the controller

        res.status(200).json({ aaaaa: "Welcome to the Riddle Server!" });
    });


    app.get("/riddles", async (req, res) => {
        try {
            const riddles = await mongoService.getAllDocuments(mongoService.client, "riddles");
            res.status(200).json(riddles);
        } catch (error) {
            console.error("Error fetching riddles:", error);
            res.status(500).json({ error: "Failed to fetch riddles" });
        }
    });

    app.use((req, res) => {
        res.status(404).json({ msg: "Route not find" });
    });
}