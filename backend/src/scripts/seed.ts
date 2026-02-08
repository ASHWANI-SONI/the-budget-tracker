import { AppDataSource } from "../config/data-source";
import { seedDatabase } from "../services/db/seeder";

async function runSeed() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source initialized for manual seeding");
        await seedDatabase();
        console.log("Manual seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error during manual seeding:", error);
        process.exit(1);
    }
}

runSeed();
