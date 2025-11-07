import { prisma } from '../../db/prisma';
import type { Prisma } from '@prisma/client';

export type ConversationWithMeta = Prisma.ConversationGetPayload<{
  include: {
    ConversationMeta: true;
    participants: { include: { user: { select: { id: true, name: true } } } };
    messages: false;
  }
}>;

/**
 * Cria uma conversa (opcionalmente vinculada a um Service) e adiciona participantes.
 * Também cria/atualiza o ConversationMeta para ordenação na lista.
 */
export async function createConversation(params: {
  serviceId?: string | null;
  participantIds: string[]; // ids de User
}): Promise<ConversationWithMeta> {
  if (!params.participantIds?.length) {
    throw new Error('participant_ids_required');
  }

  const conversation = await prisma.conversation.create({
    data: {
      service: params.serviceId ? { connect: { id: params.serviceId } } : undefined,
      participants: {
        create: params.participantIds.map((userId) => ({ user: { connect: { id: userId } } }))
      }
    },
    include: {
      ConversationMeta: true,
      participants: { include: { user: { select: { id: true, name: true } } } }
    }
  });

  // Garante meta (idempotente via upsert)
  await prisma.conversationMeta.upsert({
    where: { conversationId: conversation.id },
    create: { conversationId: conversation.id, lastMessageAt: conversation.createdAt, lastMessageId: '' },
    update: {}
  });

  return conversation;
}

/**
 * Lista conversas de um usuário já ordenadas por atividade (ConversationMeta)
 */
export async function listUserConversations(userId: string): Promise<ConversationWithMeta[]> {
  return prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    include: {
      ConversationMeta: true,
      participants: { include: { user: { select: { id: true, name: true } } } }
    },
    orderBy: [
      { ConversationMeta: { lastMessageAt: 'desc' } },
      { createdAt: 'desc' }
    ]
  });
}

/**
 * Retorna IDs de participantes de uma conversa (útil para autorização e broadcast)
 */
export async function getConversationParticipantIds(conversationId: string): Promise<string[]> {
  const rows = await prisma.conversationParticipant.findMany({
    where: { conversationId },
    select: { userId: true }
  });
  return rows.map(r => r.userId);
}

/**
 * Verifica se user participa da conversa (autz)
 */
export async function assertUserInConversation(userId: string, conversationId: string) {
  const exists = await prisma.conversationParticipant.findFirst({
    where: { userId, conversationId },
    select: { id: true }
  });
  if (!exists) {
    const err: any = new Error('not_in_conversation');
    err.code = 'FORBIDDEN';
    throw err;
  }
}
