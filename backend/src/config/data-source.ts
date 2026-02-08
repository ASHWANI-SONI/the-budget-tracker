import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "../models/User";
import { Bank } from "../models/Bank";
import { BankTemplate } from "../models/BankTemplate";
import { Transaction } from "../models/Transaction";
import dotenv from "dotenv";

dotenv.config();

export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // For development only
    logging: false,
    entities: [User, Bank, BankTemplate, Transaction],
    migrations: [],
    subscribers: [],
});
