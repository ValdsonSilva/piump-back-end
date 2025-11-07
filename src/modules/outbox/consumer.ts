// src/modules/outbox/consumer.ts
import { prisma } from '../../db/prisma';

type Handler = (payload: any) => Promise<void>;
const handlers: Record<string, Handler> = {
  'chat.message.created': async (payload) => {
    // exemplo: enviar push, disparar webhooks futuros, indexar em busca full-text
    // por ora, no MVP podemos só logar
    // console.log('process chat.message.created', payload);
  },
};

export function startOutboxConsumer() {
  const tick = async () => {
    const batch = await prisma.outboxEvent.findMany({
      where: { status: 'PENDING', availableAt: { lte: new Date() } },
      orderBy: { createdAt: 'asc' },
      take: 50
    });

    for (const evt of batch) {
      try {
        const handler = handlers[evt.topic];
        if (handler) await handler(evt.payload);
        await prisma.outboxEvent.update({ where: { id: evt.id }, data: { status: 'SENT', sentAt: new Date() } });
      } catch (e) {
        await prisma.outboxEvent.update({
          where: { id: evt.id },
          data: {
            status: 'PENDING',
            attempts: { increment: 1 },
            error: String(e),
            availableAt: new Date(Date.now() + Math.min(60000, (evt.attempts + 1) * 2000)) // backoff
          }
        });
      }
    }
    setTimeout(tick, 1500);
  };
  tick();
}
