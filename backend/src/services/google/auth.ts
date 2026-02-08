import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

// Helper to get OAuth2 client safely
export const getOAuth2Client = () => {
    return new google.auth.OAuth2(
        process.env['GOOGLE_CLIENT_ID'] || 'placeholder',
        process.env['GOOGLE_CLIENT_SECRET'] || 'placeholder',
        process.env['G_OAUTH_REDIRECT_URL'] || 'placeholder'
    );
};

// For backward compatibility but using the helper
const oauth2Client = getOAuth2Client();

export const getAuthUrl = () => {
    const scopes = [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/gmail.readonly',
        // Add Gmail modify if we want to mark as read/trash
    ];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent' // Force refresh token generation
    });
};

export const getTokens = async (code: string) => {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
};

export const getUserInfo = async (accessToken: string) => {
    const oauth2 = google.oauth2({
        auth: oauth2Client,
        version: 'v2'
    });

    oauth2Client.setCredentials({ access_token: accessToken });

    const userInfo = await oauth2.userinfo.get();
    return userInfo.data;
};

export const getGmailClient = (accessToken: string, refreshToken?: string) => {
    const client = getOAuth2Client();

    client.setCredentials({
        access_token: accessToken,
        refresh_token: refreshToken
    });

    return google.gmail({ version: 'v1', auth: client });
}

export const setupGmailWatch = async (accessToken: string, refreshToken?: string) => {
    const gmail = getGmailClient(accessToken, refreshToken);

    const topicName = `projects/${process.env.GOOGLE_PROJECT_ID}/topics/${process.env.PUBSUB_TOPIC_NAME}`;

    const response = await gmail.users.watch({
        userId: 'me',
        requestBody: {
            topicName: topicName,
            labelIds: ['INBOX']
        }
    });

    return response.data;
}
