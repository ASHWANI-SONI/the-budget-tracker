import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { BankTemplate } from "./BankTemplate";
import { Transaction } from "./Transaction";

@Entity("banks")
export class Bank {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ unique: true })
    name!: string;

    @Column({ name: "sender_email" })
    senderEmail!: string;

    @Column({ name: "is_active", default: true })
    isActive!: boolean;

    @OneToMany(() => BankTemplate, template => template.bank)
    templates!: BankTemplate[];

    @OneToMany(() => Transaction, transaction => transaction.bank)
    transactions!: Transaction[];
}
