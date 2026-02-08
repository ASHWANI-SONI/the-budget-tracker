import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from "typeorm";
import { Transaction } from "./Transaction";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ unique: true, name: "google_id" })
    googleId!: string;

    @Column({ name: "access_token", type: "text", nullable: true })
    accessToken!: string;

    @Column({ name: "refresh_token", type: "text", nullable: true })
    refreshToken!: string;

    @Column({ name: "history_id", nullable: true })
    historyId!: string;

    @Column({ name: "total_balance", type: "decimal", precision: 19, scale: 4, default: 0 })
    totalBalance!: number;

    @Column({ name: "currency_code", length: 3, default: "INR" })
    currencyCode!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;

    @OneToMany(() => Transaction, transaction => transaction.user)
    transactions!: Transaction[];
}
