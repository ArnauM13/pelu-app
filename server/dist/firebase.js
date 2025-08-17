"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firebaseAuth = void 0;
const app_1 = require("firebase-admin/app");
const auth_1 = require("firebase-admin/auth");
const firebaseProjectId = process.env.FIREBASE_PROJECT_ID;
const firebaseClientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const firebasePrivateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
if (firebaseProjectId && firebaseClientEmail && firebasePrivateKey) {
    (0, app_1.initializeApp)({
        credential: (0, app_1.cert)({
            projectId: firebaseProjectId,
            clientEmail: firebaseClientEmail,
            privateKey: firebasePrivateKey
        })
    });
}
else {
    (0, app_1.initializeApp)({ credential: (0, app_1.applicationDefault)() });
}
exports.firebaseAuth = (0, auth_1.getAuth)();
