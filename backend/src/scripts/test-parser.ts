import { TemplateParser, BankTemplateConfig } from '../services/parser/TemplateParser';
import { TransactionType } from '../models/Transaction';
import { HDFC_TEMPLATE } from '../templates/hdfc';

const parser = new TemplateParser();

const samples = [
    {
        name: 'HDFC UPI Credit (User Sample)',
        body: "Dear Customer, Rs. 1.00 is successfully credited to your account **0072 by VPA 7210072672@ptyes Ashwani Soni on 08-02-26. Your UPI transaction reference number is 299748920022. Thank you for banking with us. Warm Regards, HDFC Bank",
        template: HDFC_TEMPLATE
    },
    {
        name: 'HDFC Standard Debit',
        body: "Rs. 1500.00 debited from a/c **1234 on 12-05-2024 to Zomato",
        template: HDFC_TEMPLATE
    }
];

console.log('--- Testing Parser ---');

samples.forEach(sample => {
    console.log(`\nTesting: ${sample.name}`);
    const result = parser.parse(sample.body, sample.template);
    if (result) {
        console.log('✅ Success!');
        console.log('Result:', JSON.stringify(result, null, 2));
    } else {
        console.log('❌ Failed to parse');
    }
});
