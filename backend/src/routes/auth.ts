import express from 'express';
import { getAuthUrl, getTokens, getUserInfo } from '../services/google/auth';
import { AppDataSource } from '../config/data-source';
import { User } from '../models/User';

const router = express.Router();

// GET /api/auth/google
// Redirects user to Google Login
router.get('/google', (req, res) => {
    const url = getAuthUrl();
    res.redirect(url);
});

// GET /api/auth/google/callback
// Handles Google callback, gets tokens, creates/updates user
router.get('/google/callback', async (req, res) => {
    const code = req.query.code as string;

    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        const tokens = await getTokens(code);
        const userInfo = await getUserInfo(tokens.access_token!);

        const userRepository = AppDataSource.getRepository(User);

        let user = await userRepository.findOneBy({ googleId: userInfo.id! });

        if (!user) {
            // Create new user
            user = new User();
            user.email = userInfo.email!;
            user.googleId = userInfo.id!;
            user.totalBalance = 0; // Default
        }

        // Update tokens
        user.accessToken = tokens.access_token!;
        if (tokens.refresh_token) {
            user.refreshToken = tokens.refresh_token;
        }

        await userRepository.save(user);

        // Setup Gmail watch for this user (to receive push notifications)
        try {
            const { getGmailClient, setupGmailWatch } = await import('../services/google/auth');
            await setupGmailWatch(tokens.access_token!, tokens.refresh_token || undefined);
            console.log('Gmail watch activated for user:', user.email);
        } catch (watchError) {
            console.error('Failed to setup Gmail watch:', watchError);
            // Continue anyway - user can still use the app
        }

        // Redirect to Frontend Dashboard with some session/token
        // For MVP, we might just redirect to localhost:5173/dashboard?uid=...
        // In production, use a proper session or JWT
        res.redirect(`http://localhost:5173/dashboard?userId=${user.id}`);

    } catch (error) {
        console.error('Error during Google Auth:', error);
        res.status(500).json({ error: 'Authentication failed' });
    }
});

export default router;
