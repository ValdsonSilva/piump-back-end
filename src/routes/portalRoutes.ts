import { Request, Response, Router } from 'express';
import { stripe, createPortalSession } from '../services/stripe.js';

export const portalRouter = Router();

portalRouter.post('/', async (req, res) => {
    if (!stripe) return res.status(503).json({ error: 'Stripe não configurado' });
    const { email, customerId } = req.body as { email?: string; customerId?: string };
    try {
        let cid = customerId;
        if (!cid && email) {
            const search = await stripe.customers.search({ query: `email:'${email}'` });
            cid = search.data[0]?.id;
        }
        if (!cid) return res.status(404).json({ error: 'Customer não encontrado' });
        const session = await createPortalSession(cid);
        res.json({ url: session.url });
    } catch (e: any) {
        res.status(400).json({ error: e.message });
    }
});