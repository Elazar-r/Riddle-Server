import express from 'express';
const app = express();
const PORT = process.env.PORT || 3000;
import configRoutes from "./routes/configRoutes.js";


app.use(express.json());
configRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});