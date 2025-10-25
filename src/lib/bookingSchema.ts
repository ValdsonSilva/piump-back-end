import { z } from 'zod';

// Schema for validating booking data
export const bookingSchema = z.object({
    userId: z.string().min(1), // 1
    zip: z.string(),
    bins: z.number().optional(),
    plan: z.enum(['clean', 'family', 'fresh', 'custom']),
    ampm: z.enum(['AM', 'PM']),
    sameDay: z.boolean(),
    bookingId: z.string(),
    assignedDate: z.string(),
    status: z.enum(["pending", "scheduled", "cancelled", "done"]),
    stripeCustomerId: z.string().optional(),
    stripeSubscriptionId: z.string().optional(),
}); 