import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { User } from "./User";
import { Bank } from "./Bank";

export enum TransactionType {
    CREDIT = "CREDIT",
    DEBIT = "DEBIT"
}

export enum TransactionStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    DISCARDED = "DISCARDED"
}

@Entity("transactions")
export class Transaction {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "user_id" })
    userId!: string;

    @ManyToOne(() => User, user => user.transactions)
    @JoinColumn({ name: "user_id" })
    user!: User;

    @Column({ name: "bank_id", nullable: true })
    bankId!: string;

    @ManyToOne(() => Bank, bank => bank.transactions)
    @JoinColumn({ name: "bank_id" })
    bank!: Bank;

    @Column({ name: "email_message_id", unique: true, nullable: true })
    emailMessageId?: string;

    @Column({ type: "decimal", precision: 19, scale: 4 })
    amount!: number;

    @Column({ type: "enum", enum: TransactionType })
    type!: TransactionType;

    @Column("text", { nullable: true })
    description!: string;

    @Column({ name: "account_last_4", nullable: true, length: 4 })
    accountLast4!: string;

    @Column({ name: "transaction_date", type: "timestamp with time zone" })
    transactionDate!: Date;

    @Column({ type: "enum", enum: TransactionStatus, default: TransactionStatus.PENDING })
    status!: TransactionStatus;

    @Column("text", { name: "raw_body", nullable: true })
    rawBody!: string;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
