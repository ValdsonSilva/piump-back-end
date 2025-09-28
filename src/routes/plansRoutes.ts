import { Router } from 'express';
import { planToPriceId } from '../services/stripe.js';
import { requireAuth } from '../middleware/auth.js';

export const plansRouter = Router();

plansRouter.get('/', requireAuth, (_req, res) => {
    res.json({
        plans: [
            {
                key: 'clean', name: 'Clean Bin', priceId: planToPriceId.clean,
                billing: 'monthly'
            },
            {
                key: 'family', name: 'Family Bin', priceId: planToPriceId.family,
                billing: 'monthly'
            },
            {
                key: 'fresh', name: 'Fresh Entry', priceId: planToPriceId.fresh,
                billing: 'monthly'
            },
            {
                key: 'custom', name: 'Custom Care', priceId: planToPriceId.custom,
                billing: 'monthly (variable)'
            }
        ]
    });
});
