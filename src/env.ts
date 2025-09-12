import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
    // Básico
    PORT: z.coerce.number().default(8080),
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    TZ: z.string().default('America/New_York'),

    // FRONTEND_URL: z.string().url({ message: 'Use uma URL completa, ex: http://localhost:5173' }),
    FRONTEND_URL: z.string().optional(),
    ADMIN_BASIC_USER: z.string().optional(),
    ADMIN_BASIC_PASS: z.string().optional(),
    ALLOWED_ZIPS: z.string().optional().default(''),
    JWT_SECRET: z.string().default('dev-secret-change-me'),
    JWT_EXPIRES_IN: z.string().default('7d'),

    // DB (Neon)
    DATABASE_URL: z.string().min(1, { message: 'DATABASE_URL (Neon) é obrigatório' }),

    // Stripe – só SECRET obrigatório para subir
    // STRIPE_SECRET: z.string().min(1, { message: 'STRIPE_SECRET é obrigatório' }),
    STRIPE_SECRET: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    STRIPE_PRICE_CLEAN: z.string().optional(),
    STRIPE_PRICE_FAMILY: z.string().optional(),
    STRIPE_PRICE_FRESH: z.string().optional(),
    STRIPE_PRICE_CUSTOM: z.string().optional(),
    STRIPE_PRICE_SAMEDAY: z.string().optional(),

    // Twilio (opcional)
    TWILIO_ACCOUNT_SID: z.string().optional(),
    TWILIO_AUTH_TOKEN: z.string().optional(),
    TWILIO_FROM: z.string().optional(),

    // SMTP (opcional)
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    EMAIL_FROM: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error('❌ Variáveis de ambiente inválidas:');
    for (const i of parsed.error.issues) {
        console.error(`- ${i.path.join('.')}: ${i.message}`);
    }
    process.exit(1);
}

export const env = parsed.data;
export const ALLOWED_ZIPS = env.ALLOWED_ZIPS.split(',').map(s => s.trim()).filter(Boolean);
