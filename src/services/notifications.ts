import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { env } from '../env.js';

const mailEnabled = !!(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS && env.EMAIL_FROM);

const transporter = mailEnabled
    ? nodemailer.createTransport({ host: env.SMTP_HOST, port: Number(env.SMTP_PORT || 25), auth: { user: env.SMTP_USER, pass: env.SMTP_PASS } })
    : null;

const smsEnabled = !!(env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM);
const sms = smsEnabled ? twilio(env.TWILIO_ACCOUNT_SID!, env.TWILIO_AUTH_TOKEN!) : null;

export async function sendEmail(to: string, subject: string, html: string) {
    if (!transporter) return console.log('[email] skipped (SMTP not configured)');
    await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
}

export async function sendSMS(to: string, body: string) {
    if (!sms) return console.log('[sms] skipped (Twilio not configured)');
    await sms.messages.create({ from: env.TWILIO_FROM, to, body });
}