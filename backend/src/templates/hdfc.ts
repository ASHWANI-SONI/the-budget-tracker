import { BankTemplateConfig } from "../services/parser/TemplateParser";
import { TransactionType } from "../models/Transaction";

export const HDFC_TEMPLATE: BankTemplateConfig = {
    bankName: 'HDFC Bank',
    senderEmail: 'alerts@hdfcbank.net',
    patterns: [
        {
            type: TransactionType.DEBIT,
            // Matches: "Rs. 1500.00 debited from a/c **1234 on 12-05-2024 to Zomato"
            regex: String.raw`Rs\.\s*(?<amount>[\d,]+(?:\.\d{2})?)\s*debited\s*from\s*a\/c\s*\**(?<account>\d{4})\s*on\s*(?<date>\d{2}-\d{2}-\d{4})(?:\s*to\s*(?<description>.*))?`,
            dateFormat: 'dd-MM-yyyy'
        },
        {
            type: TransactionType.CREDIT,
            // Matches: "Rs. 5000.00 credited to a/c **1234 on 12-05-2024 by Salary"
            regex: String.raw`Rs\.\s*(?<amount>[\d,]+(?:\.\d{2})?)\s*credited\s*to\s*a\/c\s*\**(?<account>\d{4})\s*on\s*(?<date>\d{2}-\d{2}-\d{4})(?:\s*by\s*(?<description>.*))?`,
            dateFormat: 'dd-MM-yyyy'
        }
    ]
};
