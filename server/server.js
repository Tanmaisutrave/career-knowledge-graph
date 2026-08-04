import dotenv from "dotenv";
import app from "./app.js";
import driver from "./config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await driver.verifyConnectivity();

        console.log("✅ Connected to CognoDB");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

    } catch (error) {

        console.error("❌ Database Connection Failed");
        console.error(error);

    }
}

startServer();