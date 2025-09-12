import express, { Response, Request } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { env } from './env.js';
import { plansRouter } from './routes/plansRoutes.js';
import { portalRouter } from './routes/portalRoutes.js';
import { usersRouter } from './routes/userRoutes.js';
import { webhooksRouter } from './routes/webhooksRoutes.js';
import { startCronJobs } from './services/scheduler.js';
import { bookingsRouter } from './routes/bookingRoutes.js';

const app = express();
const logger = pino({ level: process.env.LOG_LEVEL || 'info' });


// Stripe webhooks need raw body
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }),
    (req: Request, res: Response, next) => {
        (req as any).rawBody = (req as any).rawBody || (req as any).body;
        next();
    }, webhooksRouter);

// Regular middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(pinoHttp({ logger }));
app.use(express.json());


// Routes
app.get('/', (_req, res) => res.json({
    ok: true,
    stripe: !!process.env.STRIPE_SECRET,
    stripePrices: ['STRIPE_PRICE_CLEAN', 'STRIPE_PRICE_FAMILY', 'STRIPE_PRICE_FRESH', 'STRIPE_PRICE_CUSTOM', 'STRIPE_PRICE_SAMEDAY']
        .filter(k => !!process.env[k as keyof NodeJS.ProcessEnv]),
    emailEnabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
    smsEnabled: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM),
    db: !!process.env.DATABASE_URL
}));

app.use('/api/plans', plansRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/portal', portalRouter);
app.use('/api/users', usersRouter);

app.listen(Number(env.PORT), () => {
    logger.info(`Server running on :${env.PORT}`);
    startCronJobs();
});