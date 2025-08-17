"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFirebaseToken = verifyFirebaseToken;
const firebase_1 = require("../firebase");
async function verifyFirebaseToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.startsWith('Bearer ')
            ? authHeader.substring('Bearer '.length)
            : undefined;
        if (!token) {
            return res.status(401).json({ message: 'Missing Authorization header' });
        }
        const decoded = await firebase_1.firebaseAuth.verifyIdToken(token);
        req.user = { uid: decoded.uid, email: decoded.email ?? null };
        return next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}
