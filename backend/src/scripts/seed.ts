import { AppDataSource } from "../config/data-source";
import { Bank } from "../models/Bank";
import { BankTemplate } from "../models/BankTemplate";
import { HDFC_TEMPLATE } from "../templates/hdfc";

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log("Data Source initialized for seeding");

        const bankRepo = AppDataSource.getRepository(Bank);
        const templateRepo = AppDataSource.getRepository(BankTemplate);

        // Seed HDFC Bank
        let hdfc = await bankRepo.findOneBy({ name: "HDFC Bank" });
        if (!hdfc) {
            hdfc = new Bank();
            hdfc.name = "HDFC Bank";
            hdfc.senderEmail = "alerts@hdfcbank.net";
            await bankRepo.save(hdfc);
            console.log("Created HDFC Bank");
        }

        // Seed HDFC Template
        const existingTemplate = await templateRepo.findOneBy({ bankId: hdfc.id });
        if (!existingTemplate) {
            const template = new BankTemplate();
            template.bankId = hdfc.id;
            template.templateJson = HDFC_TEMPLATE;
            await templateRepo.save(template);
            console.log("Created HDFC Template");
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Error during seeding:", error);
        process.exit(1);
    }
}

seed();
