import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Bank } from "../models/Bank";
import { BankTemplate } from "../models/BankTemplate";
import { Transaction } from "../models/Transaction";
import dotenv from "dotenv";

dotenv.config();

// Debug: Log if DATABASE_URL is present (not the value itself for security)
console.log('[Config] DATABASE_URL present:', !!process.env.DATABASE_URL);
console.log('[Config] NODE_ENV:', process.env.NODE_ENV);

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // Enable for now to ensure tables are created in Railway DB
    logging: false,
    entities: [User, Bank, BankTemplate, Transaction],
    migrations: [],
    subscribers: [],
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
