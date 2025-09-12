import { z } from 'zod';

// Schema for validating booking data
export const bookingSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(8), // min (94331777)
    address: z.string().min(5),
    zip: z.string().min(3),
    bins: z.number().int().min(1).max(10),
    plan: z.enum(['clean', 'family', 'fresh', 'custom']),
    ampm: z.enum(['AM', 'PM']),
    sameDay: z.boolean()
}); 