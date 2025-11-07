// src/modules/messages/service.ts
import { prisma } from '../../db/prisma.js';
import { produceOutbox } from '../outbox/producer.js';

export async function createMessage(params: {
    conversationId: string;
    senderId: string;
    content: string;
}) {
    // valida participação
    const participant = await prisma.conversationParticipant.findFirst({
        where: {
            conversationId: params.conversationId,
            userId: params.senderId
        }
    });

    if (!participant) throw new Error('not_in_conversation');

    // cria a mensagem
    const msg = await prisma.message.create({
        data: {
            conversationId: params.conversationId,
            senderId: params.senderId,
            content: params.content
        }
    });

    // atualiza meta p/ ordenar lista
    await prisma.conversationMeta.upsert({
        where: { conversationId: params.conversationId },
        create: { conversationId: params.conversationId, lastMessageAt: msg.createdAt, lastMessageId: msg.id },
        update: { lastMessageAt: msg.createdAt, lastMessageId: msg.id }
    });

    // produz evento na outbox (EDA light)
    await produceOutbox('chat.message.created', {
        messageId: msg.id,
        conversationId: msg.conversationId,
        senderId: msg.senderId
    });

    return msg;
}
