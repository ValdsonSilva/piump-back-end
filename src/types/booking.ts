
export type PlanKey = "clean" | "family" | "fresh" | "custom";

export interface BookingInput {
    name: string;   
    email: string;
    phone: string;
    address: string;
    zip: string;
    bins: number;
    plan: PlanKey;
    ampm: "AM" | "PM";
    sameDay: boolean;
}

export interface BookingRow extends BookingInput {
    bookingId: string;
    assignedDate: string; // ISO date yyyy-mm-dd
    status: "pending" | "scheduled" | "cancelled";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
}

