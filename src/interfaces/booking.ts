
export type PlanKey = "clean" | "family" | "fresh" | "custom";

export interface BookingInput {
    userId: string;
    zip: string,
    bins?: number;
    plan: PlanKey;
    ampm: "AM" | "PM";
    sameDay: boolean;
    assignedDate: string; // ISO date yyyy-mm-dd
}

export interface BookingRow extends BookingInput {
    bookingId: string;
    status: "pending" | "scheduled" | "cancelled" | "done";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}

