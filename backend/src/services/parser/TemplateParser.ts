import { TransactionType } from "../../models/Transaction";

export interface TransactionData {
    amount: number;
    type: TransactionType;
    accountLast4: string;
    date: Date;
    description: string;
}

export interface BankTemplateConfig {
    bankName: string;
    senderEmail: string;
    patterns: Array<{
        type: TransactionType;
        regex: string; // Named capture groups: amount, account, date, description
        dateFormat: string; // Date format string (e.g., 'dd-MM-yyyy')
    }>;
}

export class TemplateParser {
    parse(emailBody: string, template: BankTemplateConfig): TransactionData | null {
        // Normalize email body: remove HTML tags if present, though we expect raw text mostly
        const cleanBody = emailBody.replace(/<[^>]*>?/gm, '');

        for (const pattern of template.patterns) {
            try {
                const regex = new RegExp(pattern.regex, 'i'); // Case insensitive
                const match = cleanBody.match(regex);

                if (match && match.groups) {
                    // Extract and validate amount
                    let amountStr = match.groups.amount || '0';
                    amountStr = amountStr.replace(/,/g, ''); // Remove commas
                    const amount = parseFloat(amountStr);

                    if (isNaN(amount)) continue;

                    // Extract account
                    const accountLast4 = match.groups.account || '';

                    // Extract Description
                    const description = match.groups.description?.trim() || 'Parsed Transaction';

                    // Extract Date using basic parsing or regex match
                    // In a real generic parser, we'd use a date library like date-fns with pattern.dateFormat
                    // For now, we will attempt to parse the date string or default to NOW if regex doesn't catch it
                    // NOTE: Robust date parsing requires date-fns or moment. We will assume standard JS date parsing for MVP proof
                    // or that the regex puts it in a parseable format.
                    // For this MVP step, let's just use current date if parsing fails, but try to parse key formats.
                    let date = new Date();
                    if (match.groups.date) {
                        // Very basic manual parsing for dd-mm-yyyy or similar common India bank formats
                        // Assuming pattern.dateFormat hints at the structure. 
                        // Implementation detail: For production, import { parse } from 'date-fns'
                        const dateStr = match.groups.date;
                        // Simple heuristic for dd-mm-yyyy or dd/mm/yyyy
                        const parts = dateStr.match(/(\d{2})[-/](\d{2})[-/](\d{4})/);
                        if (parts) {
                            // parts[1] = day, parts[2] = month, parts[3] = year
                            date = new Date(`${parts[3]}-${parts[2]}-${parts[1]}`);
                        } else {
                            // Try native parse
                            const nativeDate = new Date(dateStr);
                            if (!isNaN(nativeDate.getTime())) {
                                date = nativeDate;
                            }
                        }
                    }

                    return {
                        amount,
                        type: pattern.type,
                        accountLast4,
                        date,
                        description
                    };
                }
            } catch (error) {
                console.error(`Error parsing pattern for bank ${template.bankName}:`, error);
                // Continue to next pattern
            }
        }
        return null;
    }
}
