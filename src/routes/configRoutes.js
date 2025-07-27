import { getRiddles } from "../service/riddlesService.js";

let requestNumber = 0;

export default function config(app) {
    app.use((req, res, next) => {
        requestNumber++;
        next();
    });

    app.get("/", (req, res) => {

        // TODO: call the function to get the riddle list from the controller

        console.log(`Request ${requestNumber}, GET request to the root route`);
        res.status(200).json({ aaaaa: "Welcome to the Riddle Server!" });

    });


    app.get("/riddles", async (req, res) => {
        try {
            const riddles = await getRiddles();
            console.log(`Request ${requestNumber}, GET request to /riddles`);
            res.status(200).json(riddles);
        } catch (error) {
            console.error(`Error fetching riddles: ${error.message}`);
            res.status(500).json({ msg: "Internal Server Error" });
        }
    });


    app.use((req, res) => {
        console.log(`Request ${requestNumber}, 404 Not Found for ${req.originalUrl}`);
        res.status(404).json({ msg: "Route not found" });

    });
}