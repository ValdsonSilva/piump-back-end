import type { FastifyInstance } from 'fastify';
import { prisma } from '../../db/prisma';

/**
 * Registra handlers relacionados a conversas no Socket.IO.
 * Chame em server.ts depois de decorar app.io e do middleware de auth do socket.
 *
 *   import { registerConversationSocket } from './modules/conversations/socket';
 *   registerConversationSocket(app);
 */
export function registerConversationSocket(app: FastifyInstance) {
  const io = app.io;

  io.on('connection', async (socket) => {
    const userId = (socket as any).userId as string;

    // 1) Entrar automaticamente nas salas de todas as conversas do usuário
    try {
      const convs = await prisma.conversationParticipant.findMany({
        where: { userId },
        select: { conversationId: true }
      });
      convs.forEach(c => socket.join(roomOf(c.conversationId)));
      // opcional: também uma sala direta por usuário (para notificações direcionadas)
      socket.join(userRoom(userId));
    } catch (e) {
      app.log.error({ err: e }, 'join-conversation-rooms-failed');
    }

    // 2) Permitir "join" sob demanda (ex.: ao abrir uma conversa no front)
    socket.on('conversation:join', ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return;
      socket.join(roomOf(conversationId));
    })

    // saindo de uma sala específica
    socket.on('conversation:leave', ({ conversationId }: { conversationId: string }) => {
      if (!conversationId) return;
      socket.leave(roomOf(conversationId));
    });

    // 3) Evento de digitação (typing indicators)
    socket.on('typing', ({ conversationId, isTyping }: { conversationId: string; isTyping: boolean }) => {
      if (!conversationId) return;
      socket.to(roomOf(conversationId)).emit('typing', { userId, isTyping: !!isTyping });
    });

    // 4) Presença simples (online/offline) — opcional
    io.to([...socket.rooms]).emit('presence', { userId, status: 'online' });

    socket.on('disconnect', () => {
      // broadcasting para conversas em que o socket estava
      io.to([...socket.rooms]).emit('presence', { userId, status: 'offline' });
    });
  });
}

/** Retorna o nome específico da sala de conversa */
export function roomOf(conversationId: string) {
  return `conv:${conversationId}`;
}

/** Sala direta por usuário (útil para notificações específicas) */
export function userRoom(userId: string) {
  return `user:${userId}`;
}
