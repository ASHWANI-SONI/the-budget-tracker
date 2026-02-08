import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Bank } from "./Bank";

@Entity("bank_templates")
export class BankTemplate {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "bank_id" })
    bankId!: string;

    @ManyToOne(() => Bank, bank => bank.templates)
    @JoinColumn({ name: "bank_id" })
    bank!: Bank;

    @Column("jsonb", { name: "template_json" })
    templateJson!: any;

    @CreateDateColumn({ name: "created_at" })
    createdAt!: Date;
}
