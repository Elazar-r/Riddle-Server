
export default function config(app) {
    app.get("/", (req, res) => {

        // TODO: call the function to get the riddle list from the controller

        res.status(200).json({ aaaaa: "Welcome to the Riddle Server!" });
        console.log(`GET request to the root route`);
        
    });


    app.use((req, res) => {
        res.status(404).json({ msg: "Route not find" });
    });
}