import { v4 as uuid } from 'uuid';
import type { BookingInput, BookingRow } from '../types/booking.js';
import { computeAssignedDate } from '../lib/time.js';

// Builds a booking row with a unique ID and assigned date based on sameDay preference
export function buildBookingRow(input: BookingInput): BookingRow {
    const bookingId = uuid();
    const assignedDate = computeAssignedDate(input.sameDay);

    if (!assignedDate) {
        throw new Error('Cannot schedule booking for the selected date.');
    }

    return {
        bookingId,
        ...input,
        assignedDate,
        status: 'pending'
    };
}
