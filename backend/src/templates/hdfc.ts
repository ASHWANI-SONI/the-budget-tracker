import { BankTemplateConfig } from "../services/parser/TemplateParser";
import { TransactionType } from "../models/Transaction";

export const HDFC_TEMPLATE: BankTemplateConfig = {
    bankName: 'HDFC Bank',
    senderEmail: 'alerts@hdfcbank.bank.in',
    patterns: [
        {
            type: TransactionType.DEBIT,
            // Matches: "Rs. 1500.00 debited from a/c **1234 on 12-05-2024 to Zomato"
            // Matches variations like "account", "a/c no", etc.
            regex: String.raw`Rs\.?\s*(?<amount>[\d,]+(?:\.\d{2})?)\s*(?:is\s+)?debited\s+from\s+(?:a\/c|account)\s*(?:no\.?\s*)?\**(?<account>\d{4})\s+on\s+(?<date>\d{2}-\d{2}-\d{2,4})(?:\s+(?:to|at)\s+(?<description>.*?))?(?:\.|$|(?= Your))`,
            dateFormat: 'dd-MM-yyyy'
        },
        {
            type: TransactionType.CREDIT,
            // Matches: "Rs. 5000.00 credited to a/c **1234 on 12-05-2024 by Salary"
            regex: String.raw`Rs\.?\s*(?<amount>[\d,]+(?:\.\d{2})?)\s*(?:is\s+)?successfully\s+credited\s+to\s+(?:your\s+)?(?:a\/c|account)\s*(?:no\.?\s*)?\**(?<account>\d{4})(?:\s+by\s+(?<description>.*?))?\s+on\s+(?<date>\d{2}-\d{2}-\d{2,4})`,
            dateFormat: 'dd-MM-yyyy'
        },
        {
            type: TransactionType.CREDIT,
            // HDFC UPI/VPA Credit: "Rs. 1.00 is successfully credited to your account **0072 by VPA 7210072672@ptyes Ashwani Soni on 08-02-26."
            regex: String.raw`Rs\.?\s*(?<amount>[\d,]+(?:\.\d{2})?)\s*is\s*successfully\s*credited\s*to\s*your\s*account\s*\**(?<account>\d{4})\s*by\s*VPA\s*(?<description>.*?)\s*on\s*(?<date>\d{2}-\d{2}-\d{2,4})`,
            dateFormat: 'dd-MM-yy'
        },
        {
            type: TransactionType.DEBIT,
            // HDFC UPI/VPA Debit: "Rs. 100.00 is debited from your account **0072 by VPA ... on 08-02-26."
            regex: String.raw`Rs\.?\s*(?<amount>[\d,]+(?:\.\d{2})?)\s*is\s*debited\s*from\s*your\s*account\s*\**(?<account>\d{4})\s*to\s*VPA\s*(?<description>.*?)\s*on\s*(?<date>\d{2}-\d{2}-\d{2,4})`,
            dateFormat: 'dd-MM-yy'
        }
    ]
};
