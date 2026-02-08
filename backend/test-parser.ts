import { TemplateParser } from "./src/services/parser/TemplateParser";
import { HDFC_TEMPLATE } from "./src/templates/hdfc";

const parser = new TemplateParser();

const testCases = [
    {
        name: "HDFC Debit",
        content: "Rs. 1,500.00 debited from a/c **1234 on 12-05-2024 to Zomato UPI",
        expected: { amount: 1500, type: "DEBIT", accountLast4: "1234" }
    },
    {
        name: "HDFC Credit",
        content: "Rs. 50,000.00 credited to a/c **1234 on 01-05-2024 by Salary Transfer",
        expected: { amount: 50000, type: "CREDIT", accountLast4: "1234" }
    },
    {
        name: "HDFC Debit (No Description)",
        content: "Rs. 200.00 debited from a/c **5678 on 15-05-2024",
        expected: { amount: 200, type: "DEBIT", accountLast4: "5678" }
    },
    {
        name: "Invalid Format",
        content: "This is a random email about nothing.",
        expected: null
    }
];

console.log("Running Parser Tests...\n");

testCases.forEach(test => {
    const result = parser.parse(test.content, HDFC_TEMPLATE);
    console.log(`Test: ${test.name}`);
    console.log(`Input: "${test.content}"`);

    if (!result) {
        if (test.expected === null) {
            console.log("✅ Passed (Returned null as expected)");
        } else {
            console.log("❌ Failed (Returned null, expected object)");
        }
    } else {
        const amountMatch = result.amount === test.expected?.amount;
        const typeMatch = result.type === test.expected?.type;
        const accMatch = result.accountLast4 === test.expected?.accountLast4;

        if (amountMatch && typeMatch && accMatch) {
            console.log("✅ Passed");
            console.log("Parsed:", JSON.stringify(result, null, 2));
        } else {
            console.log("❌ Failed");
            console.log("Expected:", test.expected);
            console.log("Got:", result);
        }
    }
    console.log("---------------------------------------------------");
});
