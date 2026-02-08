import express from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';

const router = express.Router();

// GET /api/users/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const repo = AppDataSource.getRepository(User);
        const user = await repo.findOneBy({ id });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.json({
            id: user.id,
            email: user.email,
            totalBalance: Number(user.totalBalance),
            currencyCode: user.currencyCode
        });
    } catch (error) {
        console.error("Error fetching user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
