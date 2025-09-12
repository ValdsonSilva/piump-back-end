import {DateTime} from "luxon";

export const nowFortaleza = () => DateTime.now().setZone("America/New_York");

export function computeAssignedDate( sameDay: boolean ) {
    const now = nowFortaleza();
    const cutoff = now.set({ hour: 12, minute: 0, second: 0, millisecond: 0 });

    // Rule: after 11:00 → next day (even if user checked same-day — it's "subject to availability")
    if ( now > cutoff ) {
        return now.plus({ days: 1 }).toISODate();
    }

    // Before cutoff: if same-day selected, schedule today; otherwise today as well
    return now.toISODate();
};