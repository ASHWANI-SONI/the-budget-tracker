import express from 'express';
import { AppDataSource } from '../config/data-source';
import { Transaction, TransactionStatus, TransactionType } from '../models/Transaction';
import { User } from '../models/User';

const router = express.Router();

// GET /api/transactions/history (Confirmed transactions sorted by date)
router.get('/history', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "userId is required" });
    }

    try {
        const transactionRepo = AppDataSource.getRepository(Transaction);
        const transactions = await transactionRepo.find({
            where: {
                userId: userId as string,
                status: TransactionStatus.CONFIRMED
            },
            order: { transactionDate: 'DESC' },
            take: 50 // Limit to last 50
        });

        res.json(transactions);
    } catch (error) {
        console.error("Error fetching transaction history:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// GET /api/transactions/pending?userId=...
router.get('/pending', async (req, res) => {
    const { userId } = req.query;

    if (!userId) {
        return res.status(400).json({ error: "Missing userId" });
    }

    try {
        const repo = AppDataSource.getRepository(Transaction);
        const transactions = await repo.find({
            where: {
                userId: userId as string,
                status: TransactionStatus.PENDING
            },
            order: { transactionDate: 'DESC' }
        });
        res.json(transactions);
    } catch (error) {
        console.error("Error fetching pending transactions:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/transactions/:id/confirm
router.post('/:id/confirm', async (req, res) => {
    const { id } = req.params;
    const { amount, description, category } = req.body; // Allow editing details

    try {
        const transactionRepo = AppDataSource.getRepository(Transaction);

        // We don't need to explicitly fetch User repo here if we use relations

        let transaction = await transactionRepo.findOne({
            where: { id },
            relations: ["user"]
        });

        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        if (transaction.status === TransactionStatus.CONFIRMED) {
            return res.status(400).json({ error: "Transaction already confirmed" });
        }

        // Update fields if provided
        if (amount) transaction.amount = parseFloat(amount);
        if (description) transaction.description = description;

        transaction.status = TransactionStatus.CONFIRMED;

        // Ensure user is loaded
        if (!transaction.user) {
            return res.status(500).json({ error: "Transaction User not found or not loaded" });
        }

        await AppDataSource.transaction(async (manager) => {
            await manager.save(transaction);

            // Update User Balance
            // Note: If txn is CREDIT, add. If DEBIT, subtract.
            const user = transaction!.user;
            const txnAmount = Number(transaction!.amount);

            if (transaction!.type === "CREDIT") {
                user.totalBalance = Number(user.totalBalance) + txnAmount;
            } else {
                user.totalBalance = Number(user.totalBalance) - txnAmount;
            }

            await manager.save(user);
        });

        res.json(transaction);

    } catch (error) {
        console.error("Error confirming transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/transactions (Manual Entry)
router.post('/', async (req, res) => {
    const { amount, description, type, transactionDate, userId } = req.body;

    if (!amount || !userId || !type) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const transactionRepo = AppDataSource.getRepository(Transaction);
        const userRepo = AppDataSource.getRepository(User);

        const user = await userRepo.findOneBy({ id: userId });
        if (!user) return res.status(404).json({ error: "User not found" });

        const transaction = new Transaction();
        transaction.userId = userId;
        transaction.amount = parseFloat(amount);
        transaction.description = description || "Manual Entry";
        transaction.type = type as TransactionType;
        transaction.status = TransactionStatus.CONFIRMED; // Manual entries are auto-confirmed
        transaction.transactionDate = new Date(transactionDate || Date.now());

        // Manual entries don't have bank or email

        await AppDataSource.transaction(async (manager) => {
            await manager.save(transaction);

            // Update User Balance immediately
            const txnAmount = Number(transaction.amount);
            if (transaction.type === TransactionType.CREDIT) {
                user.totalBalance = Number(user.totalBalance) + txnAmount;
            } else {
                user.totalBalance = Number(user.totalBalance) - txnAmount;
            }
            await manager.save(user);
        });

        res.json(transaction);
    } catch (error) {
        console.error("Error creating transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE /api/transactions/:id (Discard)
router.delete('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const repo = AppDataSource.getRepository(Transaction);
        const transaction = await repo.findOneBy({ id });

        if (!transaction) {
            return res.status(404).json({ error: "Transaction not found" });
        }

        transaction.status = TransactionStatus.DISCARDED;
        await repo.save(transaction);

        res.json({ message: "Transaction discarded" });
    } catch (error) {
        console.error("Error discarding transaction:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
