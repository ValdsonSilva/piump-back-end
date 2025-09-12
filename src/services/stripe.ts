import Stripe from 'stripe';
import { env } from '../env.js';
import type { BookingInput, PlanKey } from '../types/booking.js';

export const stripe = env.STRIPE_SECRET
    ? new Stripe(env.STRIPE_SECRET, { apiVersion: '2024-06-20' as any })
    : null;


export const planToPriceId: Record<PlanKey, string> = {
    clean: env.STRIPE_PRICE_CLEAN,
    family: env.STRIPE_PRICE_FAMILY,
    fresh: env.STRIPE_PRICE_FRESH,
    custom: env.STRIPE_PRICE_CUSTOM
};

function ensureStripeReady(plan: PlanKey) {
    if (!stripe) throw new Error('STRIPE_NOT_CONFIGURED');
    const price = planToPriceId[plan];
    if (!price) throw new Error('INVALID_PLAN');
    return price;
}

export async function createCheckoutSession(bookingId: string, input: BookingInput, assignedDate: string) {

    const price = ensureStripeReady(input.plan);

    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [
        { price, quantity: 1 }
    ];

    // Add one-time same-day surcharge (first invoice only) if selected
    if (input.sameDay && env.STRIPE_PRICE_SAMEDAY) lineItems.push({ price: env.STRIPE_PRICE_SAMEDAY, quantity: 1 });

    // Add one-time bin surcharge (first invoice only) if more than 1 bin
    const session = await stripe?.checkout.sessions.create({
        mode: 'subscription',
        customer_email: input.email,
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        success_url: `${env.FRONTEND_URL}/success?booking_id=${bookingId}`,
        cancel_url: `${env.FRONTEND_URL}/cancel?booking_id=${bookingId}`,
        line_items: lineItems,
        subscription_data: {
            metadata: {
                booking_id: bookingId,
                plan: input.plan,
                zip: input.zip,
                bins: String(input.bins),
                assigned_date: assignedDate,
                ampm: input.ampm,
                same_day: String(input.sameDay)
            }
        },
        metadata: {
            booking_id: bookingId
        }
    });

    return session;
}


export async function createPortalSession(customerId: string) {
    if (!stripe) throw new Error('STRIPE_NOT_CONFIGURED');
    return stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: `${env.FRONTEND_URL}/account`
    });
}

