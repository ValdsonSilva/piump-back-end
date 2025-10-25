import { Router } from 'express';
import type Stripe from 'stripe';
import { stripe } from '../services/stripe.js';
import { env } from '../env.js';
// import { markScheduled } from '../repositories/bookinRepo.js';
// import { sendEmail } from '../services/notifications.js';


export const webhooksRouter = Router();

webhooksRouter.post('/stripe', (req, res) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: Stripe.Event;

    try {
        if (!stripe) {
            return res.status(500).send('Stripe service not initialized');
        }
        event = stripe.webhooks.constructEvent((req as any).rawBody, sig, env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    (async () => {
        switch (event.type) {
            case 'checkout.session.completed': {
                const session = event.data.object as any;
                const bookingId = session.metadata?.booking_id;
                // const customer = session.customer as string;
                // const subscription = session.subscription as string;
                // if (bookingId) {
                //     await markScheduled(bookingId, subscription);
                // }
                break;
            }
            // outros eventos se necessário
        }
    })().catch(console.error);

    res.json({ received: true });
});
