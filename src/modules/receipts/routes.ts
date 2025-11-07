// src/modules/receipts/routes.ts
import { FastifyInstance } from 'fastify';
import { prisma } from '../../db/prisma';

export async function registerReceiptRoutes(app: FastifyInstance) {
  app.post<{ Body: { messageId: string } }>('/', { preHandler: [app.authenticate] }, async (req: any) => {
    const userId = req.user.sub as string;
    const msg = await prisma.message.findUnique({ where: { id: req.body.messageId } });
    if (!msg) throw new Error('Message not found');
    // só participantes podem ler
    const participant = await prisma.conversationParticipant.findFirst({
      where: { conversationId: msg.conversationId, userId }
    });
    if (!participant) throw new Error('Participant not found');

    const receipt = await prisma.messageReadReceipt.upsert({
      where: { messageId_userId: { messageId: msg.id, userId } },
      create: { messageId: msg.id, userId },
      update: { readAt: new Date() }
    });

    app.io.to(`conv:${msg.conversationId}`).emit('receipt:new', {
      messageId: msg.id, userId, readAt: receipt.readAt
    });
    return { ok: true };
  });

  // via WS
  app.io.on('connection', (socket) => {
    socket.on('receipt:read', async ({ messageId }) => {
      const userId = (socket as any).userId as string;
      const msg = await prisma.message.findUnique({ where: { id: messageId } });
      if (!msg) return;
      const participant = await prisma.conversationParticipant.findFirst({
        where: { conversationId: msg.conversationId, userId }
      });
      if (!participant) return;

      const receipt = await prisma.messageReadReceipt.upsert({
        where: { messageId_userId: { messageId, userId } },
        create: { messageId, userId },
        update: { readAt: new Date() }
      });
      socket.to(`conv:${msg.conversationId}`).emit('receipt:new', { messageId, userId, readAt: receipt.readAt });
    });
  });
}
