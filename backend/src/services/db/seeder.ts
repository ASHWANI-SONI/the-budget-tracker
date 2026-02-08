import { AppDataSource } from "../../config/data-source";
import { Bank } from "../../models/Bank";
import { BankTemplate } from "../../models/BankTemplate";
import { HDFC_TEMPLATE } from "../../templates/hdfc";

export async function seedDatabase() {
    try {
        const bankRepo = AppDataSource.getRepository(Bank);
        const templateRepo = AppDataSource.getRepository(BankTemplate);

        console.log("[Seeder] Checking for existing templates...");

        // Seed HDFC Bank
        let hdfc = await bankRepo.findOneBy({ name: "HDFC Bank" });
        if (!hdfc) {
            hdfc = new Bank();
            hdfc.name = "HDFC Bank";
            hdfc.senderEmail = "alerts@hdfcbank.bank.in";
            await bankRepo.save(hdfc);
            console.log("[Seeder] Created HDFC Bank");
        } else if (hdfc.senderEmail !== 'alerts@hdfcbank.bank.in') {
            hdfc.senderEmail = 'alerts@hdfcbank.bank.in';
            await bankRepo.save(hdfc);
            console.log("[Seeder] Updated HDFC Bank sender email");
        }

        // Seed HDFC Template - Update if exists to ensure latest patterns
        const existingTemplate = await templateRepo.findOneBy({ bankId: hdfc.id });
        if (!existingTemplate) {
            const template = new BankTemplate();
            template.bankId = hdfc.id;
            template.templateJson = HDFC_TEMPLATE;
            await templateRepo.save(template);
            console.log("[Seeder] Created HDFC Template");
        } else {
            existingTemplate.templateJson = HDFC_TEMPLATE;
            await templateRepo.save(existingTemplate);
            console.log("[Seeder] Updated HDFC Template patterns");
        }

        const templateCount = await templateRepo.count();
        console.log(`[Seeder] Seeding check complete. Total templates: ${templateCount}`);
    } catch (error) {
        console.error("[Seeder] Error during seeding:", error);
    }
}
