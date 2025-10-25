import cron from 'node-cron';
import { DateTime } from 'luxon';
// import { listScheduledByZip } from '../repositories/bookinRepo.js';
// import { sendSMS } from './notifications.js'; // ligar quando quiser

// export function startCronJobs() {
//   // Agrupar rotas por CEP às 11:05
//   cron.schedule('5 11 * * *', async () => {

//     const today = DateTime.now().setZone('America/New_York').toISODate();

//     if (!today) throw new Error('Could not determine today\'s date.');

//     // const groups = await listScheduledByZip(today);
//     // console.log('[CRON] Route groups (DB) for', today, groups);
//   }, { timezone: 'America/New_York' });

//   // Lembrete 24h antes (ex.: 9h, para o dia seguinte)
//   cron.schedule('0 9 * * *', async () => {
//     const now = DateTime.now().setZone('America/New_York');
//     const tomorrow = now.plus({ days: 1 }).toISODate();
//     console.log('[CRON] Would send reminders for', tomorrow);
//     // aqui você pode buscar bookings + phones e chamar sendSMS(...)
//   }, { timezone: 'America/New_York' });
// }
