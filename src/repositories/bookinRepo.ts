import { PrismaClient } from "@prisma/client";
import { DateTime } from 'luxon';
import type { BookingInput } from '../types/booking.js';
import { findByUserId } from "./userRepo.js";

const prisma = new PrismaClient();

// export async function createUserIfNotExistis(input: BookingInput) {
//   const found = await prisma.user.findUnique({ where: { email: input.email } });
//   if (found) return found;
//   return prisma.user.create({
//     data: {
//       name: input.name,
//       email: input.email,
//       password: inpu
//       phone: input.phone,
//       address: input.address,
//       zip: input.zip
//     }
//   });
// }



export async function createBookingDB(bookingId: string, input: BookingInput, assignedDateISO: string) {

  // const user = await findByUserId(input.userId)

  return prisma.booking.create({
    data: {
      bookingCode: bookingId,
      userId: input.userId,
      bins: input.bins,
      plan: input.plan as any,
      ampm: input.ampm as any,
      sameDay: input.sameDay,
      assignedDate: DateTime.fromISO(assignedDateISO, { zone: 'America/New_York' }).toJSDate(),
      status: 'PENDING'
    }
  });
}

export async function listAllBookings() {
  return prisma.booking.findMany();
}

// export async function updateBookingAfterCheckout( bookingCode: string, subscriptionId: string , stripeCustomerId?: string) {
//   return prisma.booking.update({
//     where: { bookingCode },
//     data: {
//       status: 'SCHEDULED',
//       stripeSubscriptionId: subscriptionId,
//       user: stripeCustomerId ? { update: { stripeCustomerId } } : undefined
//     }
//   })
// }

export async function markScheduled(bookingCode: string, subscriptionId?: string) {
  return prisma.booking.update({
    where: { bookingCode },
    data: {
      status: 'SCHEDULED',
      ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {})
    }
  });
}

export async function groupScheduledByZip(dateISO: string) {
  const start = DateTime.fromISO(dateISO).startOf('day').toJSDate();
  const end = DateTime.fromISO(dateISO).endOf('day').toJSDate();
  const rows = await prisma.booking.findMany({
    where: { status: 'SCHEDULED', assignedDate: { gte: start, lte: end } },
    include: { user: true }
  });

  const groups: Record<string, string[]> = {};
  for (const r of rows) {
    const zip = r.user?.zip;

    if (!zip) throw Error("Zip not found")

    groups[zip] = groups[zip] || [];
    groups[zip].push(r.bookingCode);
  }

  return groups;
}
