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
        // Normalize email body: remove HTML tags and their content (style, script)
        const cleanBody = emailBody
            .replace(/<(style|script)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
            .replace(/<[^>]*>?/gm, ' ')
            .replace(/\s+/g, ' ')
            .trim();

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
                        const dateStr = match.groups.date;
                        // Support dd-mm-yyyy or dd-mm-yy (common in HDFC)
                        const parts = dateStr.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})/);
                        if (parts) {
                            const day = parseInt(parts[1], 10);
                            const month = parseInt(parts[2], 10) - 1; // 0-indexed
                            let year = parseInt(parts[3], 10);

                            // Handle 2-digit years (assuming 20xx for now)
                            if (year < 100) {
                                year += 2000;
                            }

                            date = new Date(year, month, day);
                        } else {
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
