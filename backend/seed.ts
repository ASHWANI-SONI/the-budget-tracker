import { AppDataSource } from "./src/config/data-source";
import { User } from "./src/models/User";
import { Transaction, TransactionType, TransactionStatus } from "./src/models/Transaction";
import { Bank } from "./src/models/Bank";

async function seed() {
    await AppDataSource.initialize();

    const userRepo = AppDataSource.getRepository(User);
    const bankRepo = AppDataSource.getRepository(Bank);
    const txnRepo = AppDataSource.getRepository(Transaction);

    // Create User
    let user = await userRepo.findOneBy({ email: "demo@example.com" });
    if (!user) {
        user = new User();
        user.email = "demo@example.com";
        user.googleId = "demo-google-id";
        user.totalBalance = 50000;
        await userRepo.save(user);
        console.log("Created Demo User:", user.id);
    }

    // Create Bank
    let bank = await bankRepo.findOneBy({ name: "HDFC" });
    if (!bank) {
        bank = new Bank();
        bank.name = "HDFC";
        bank.senderEmail = "alerts@hdfcbank.net";
        await bankRepo.save(bank);
        console.log("Created Bank HDFC");
    }

    // Create Transactions
    const txn1 = new Transaction();
    txn1.user = user;
    txn1.bank = bank;
    txn1.amount = 1500;
    txn1.type = TransactionType.DEBIT;
    txn1.description = "Zomato UPI";
    txn1.accountLast4 = "1234";
    txn1.status = TransactionStatus.PENDING;
    txn1.emailMessageId = "msg-001-" + Date.now();
    txn1.transactionDate = new Date();

    const txn2 = new Transaction();
    txn2.user = user;
    txn2.bank = bank;
    txn2.amount = 5000;
    txn2.type = TransactionType.CREDIT;
    txn2.description = "Salary Bonus";
    txn2.accountLast4 = "1234";
    txn2.status = TransactionStatus.PENDING;
    txn2.emailMessageId = "msg-002-" + Date.now();
    txn2.transactionDate = new Date();

    await txnRepo.save([txn1, txn2]);
    console.log("Seeded pending transactions.");

    process.exit(0);
}

seed().catch(console.error);
