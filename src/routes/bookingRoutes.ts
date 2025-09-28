import { Request, Response, Router } from 'express';
import { bookingSchema } from '../lib/validation.js';
import { ALLOWED_ZIPS } from '../env.js';
import { buildBookingRow } from '../services/bookingService.js';
import { createBookingDB, listAllBookings } from '../repositories/bookinRepo.js';
import { createCheckoutSession } from '../services/stripe.js';
import { requireAuth, requireUserType } from '../middleware/auth.js';                                                                          
import { findByUserId } from '../repositories/userRepo.js';


export const bookingsRouter = Router();


bookingsRouter.post('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const parsed = bookingSchema.parse(req.body);


    if (!ALLOWED_ZIPS.includes(parsed.zip)) {
      return res.status(400).json({ message: 'Coming soon to your area.' });
    }

    const isUserExist = await findByUserId(parsed.userId);

    if (!isUserExist) {
      return res.status(404).json({message: 'User not found'});
    }

    const row = buildBookingRow(parsed);

    // Grava no Postgres a reserva
    const booking = await createBookingDB(row.bookingId, parsed, row.assignedDate);

    // Checkout Stripe
    // const session = await createCheckoutSession(row.bookingId, parsed, row.assignedDate);

    const after11 = new Date().getHours() >= 11;
    const msg = after11 ? 'Booked after 11:00 — service will be assigned to the next day.' : 'Service planned for today.';

    return res.json({
      booking,
      // checkoutUrl: session?.url,
      message: parsed.sameDay ? 'Same-day service subject to availability. ' + msg : msg
    });

  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
});

bookingsRouter.get('/', async (req: Request, res: Response) => {
  try {
      const bookings = await listAllBookings();
      
      if (!bookings) return res.status(400).json({message: "Bookings not found."});

      return res.json(bookings);
  } catch (err: any) {
    return res.status(400).json({ error: err.message });
  }
})