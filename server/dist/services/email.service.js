"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
if (!user || !pass) {
    // eslint-disable-next-line no-console
    console.warn('EMAIL_USER or EMAIL_PASS not set; sendEmail will fail');
}
async function sendEmail(to, subject, text) {
    const transporter = nodemailer_1.default.createTransport({
        service: 'gmail',
        auth: { user, pass }
    });
    await transporter.sendMail({ from: user, to, subject, text });
    return true;
}
