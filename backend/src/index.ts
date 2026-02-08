import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './config/data-source';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import userRoutes from './routes/users';
import webhookRoutes from './routes/webhook';
import { seedDatabase } from './services/db/seeder';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configure CORS for production
const rawOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
const corsOptions = {
    origin: rawOrigin.replace(/\/$/, ''),
    credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);
app.use('/api/webhook', webhookRoutes);

app.get('/', (req, res) => {
    res.send('Budget Tracker API is running');
});

AppDataSource.initialize()
    .then(async () => {
        console.log("Data Source has been initialized!");
        await seedDatabase();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("Error during Data Source initialization", err);
    });
