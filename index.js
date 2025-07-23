import express from 'express';
import { config } from 'dotenv';
import configRoutes from "./routes/configRoutes.js";

config({ quiet: true });
const PORT = process.env.PORT || 3000;
const app = express();


app.use(express.json());
configRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});