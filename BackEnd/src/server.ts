
import express from "express";
import dotenv from "dotenv";
import { dbCheckTables } from "./config/database";
import userRoutes from "./routes/userRoutes";
import hotelRoutes from "./routes/hotelRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import reviewRoutes from "./routes/reviewRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/api", userRoutes);
app.use("/api", hotelRoutes);
app.use("/api", bookingRoutes);
app.use("/api", reviewRoutes);
const startServer = async () => {
    try {
        await dbCheckTables();

        app.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
};

startServer();