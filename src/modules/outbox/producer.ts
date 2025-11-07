// src/modules/outbox/producer.ts
import { prisma } from '../../db/prisma.js';

export async function produceOutbox(topic: string, payload: any, idempotencyKey?: string) {
  await prisma.outboxEvent.create({
    data: {
      topic,
      payload,
      idempotencyKey
    }
  });
}
