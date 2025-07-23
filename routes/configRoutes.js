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


    app.use((req, res) => {
        console.log(`Request ${requestNumber}, 404 Not Found for ${req.originalUrl}`);
        res.status(404).json({ msg: "Route not found" });

    });
}