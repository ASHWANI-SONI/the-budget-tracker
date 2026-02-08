import express from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';
import { Transaction, TransactionStatus, TransactionType } from '../models/Transaction';
import { BankTemplate } from '../models/BankTemplate';
import { getGmailClient } from '../services/google/auth';
import { TemplateParser } from '../services/parser/TemplateParser';

const router = express.Router();

interface PubSubMessage {
    message: {
        data: string;
        messageId: string;
        publishTime: string;
    };
    subscription: string;
}

interface GmailNotification {
    emailAddress: string;
    historyId: number;
}

// POST /api/webhook/gmail
// Receives Pub/Sub push notifications
router.post('/gmail', async (req, res) => {
    console.log('[Webhook] Received Pub/Sub notification');

    // Acknowledge immediately to prevent retries
    res.status(200).send('OK');

    try {
        const pubsubMessage: PubSubMessage = req.body;

        if (!pubsubMessage.message?.data) {
            console.log('[Webhook] No message data');
            return;
        }

        // Decode base64 message
        const decodedData = Buffer.from(pubsubMessage.message.data, 'base64').toString('utf-8');
        const notification: GmailNotification = JSON.parse(decodedData);

        console.log('[Webhook] Email notification for:', notification.emailAddress);

        // Find user by email
        const userRepo = AppDataSource.getRepository(User);
        const user = await userRepo.findOneBy({ email: notification.emailAddress });

        if (!user) {
            console.log('[Webhook] User not found for email:', notification.emailAddress);
            return;
        }

        if (!user.accessToken) {
            console.log('[Webhook] No access token for user');
            return;
        }

        // Get Gmail client
        const gmail = getGmailClient(user.accessToken, user.refreshToken);

        // Fetch recent unread messages from inbox
        const messagesResponse = await gmail.users.messages.list({
            userId: 'me',
            q: 'is:unread category:primary',
            maxResults: 5
        });

        const messages = messagesResponse.data.messages || [];
        console.log(`[Webhook] Found ${messages.length} unread messages`);

        // Get all bank templates
        const templateRepo = AppDataSource.getRepository(BankTemplate);
        const templates = await templateRepo.find({ relations: ['bank'] });
        console.log(`[Webhook] Loaded ${templates.length} templates`);

        const parser = new TemplateParser();
        const transactionRepo = AppDataSource.getRepository(Transaction);

        for (const msg of messages) {
            if (!msg.id) continue;

            // Check if we already processed this message
            const existingTxn = await transactionRepo.findOneBy({ emailMessageId: msg.id });
            if (existingTxn) {
                console.log('[Webhook] Message already processed:', msg.id);
                continue;
            }

            // Fetch full message
            const fullMessage = await gmail.users.messages.get({
                userId: 'me',
                id: msg.id,
                format: 'full'
            });

            // Extract sender and body
            const headers = fullMessage.data.payload?.headers || [];
            const fromHeader = headers.find(h => h.name?.toLowerCase() === 'from');
            const sender = fromHeader?.value || '';
            console.log('[Webhook] Processing message from:', sender);

            // Get message body (handle multipart)
            let body = '';
            const payload = fullMessage.data.payload;
            if (payload?.body?.data) {
                body = Buffer.from(payload.body.data, 'base64').toString('utf-8');
            } else if (payload?.parts) {
                // Try text/plain first, then text/html
                for (const part of payload.parts) {
                    if (part.mimeType === 'text/plain' && part.body?.data) {
                        body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                        break;
                    }
                }
                // If no plain text, try HTML
                if (!body) {
                    for (const part of payload.parts) {
                        if (part.mimeType === 'text/html' && part.body?.data) {
                            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
                            break;
                        }
                    }
                }
            }

            if (!body) {
                console.log('[Webhook] No body found for message:', msg.id);
                continue;
            }

            // Strip HTML tags for matching
            const cleanBody = body.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
            console.log('[Webhook] Clean body preview:', cleanBody.substring(0, 200));

            // Try each template
            for (const template of templates) {
                const templateConfig = template.templateJson;
                const templateSender = templateConfig.senderEmail?.toLowerCase() || '';
                console.log(`[Webhook] Checking template "${templateConfig.bankName}" (sender: ${templateSender})`);

                // Check if sender matches
                if (templateSender && !sender.toLowerCase().includes(templateSender)) {
                    console.log('[Webhook] Sender mismatch, skipping');
                    continue;
                }

                console.log('[Webhook] Sender matches template:', template.bank.name);

                // Parse the email - pass cleanBody instead of raw HTML
                const parsed = parser.parse(cleanBody, templateConfig);
                console.log('[Webhook] Parse result:', parsed);

                if (parsed) {
                    console.log('[Webhook] Parsed transaction:', parsed);

                    // Create pending transaction
                    const transaction = new Transaction();
                    transaction.userId = user.id;
                    transaction.bankId = template.bankId;
                    transaction.emailMessageId = msg.id;
                    transaction.amount = parsed.amount;
                    transaction.type = parsed.type as TransactionType;
                    transaction.description = parsed.description || 'Bank Transaction';
                    transaction.accountLast4 = parsed.accountLast4 || '';
                    transaction.transactionDate = parsed.date || new Date();
                    transaction.status = TransactionStatus.PENDING;
                    transaction.rawBody = body;

                    await transactionRepo.save(transaction);
                    console.log('[Webhook] Created pending transaction:', transaction.id);

                    // Mark email as read (optional)
                    try {
                        await gmail.users.messages.modify({
                            userId: 'me',
                            id: msg.id,
                            requestBody: {
                                removeLabelIds: ['UNREAD']
                            }
                        });
                    } catch (e) {
                        console.log('[Webhook] Could not mark as read (missing scope)');
                    }

                    break; // Stop trying other templates
                }
            }
        }

    } catch (error) {
        console.error('[Webhook] Error processing notification:', error);
    }
});

export default router;
