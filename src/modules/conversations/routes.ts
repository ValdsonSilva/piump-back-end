// src/modules/conversations/routes.ts
import { FastifyInstance } from 'fastify';
import { prisma } from '../../db/prisma.js';
import { createConversation, listUserConversations } from './service.js';

export async function registerConversationRoutes(app: FastifyInstance) {
    // criar conversa ligada a um Service (1:1 por seu schema)
    app.post<{ Body: { serviceId: string; participantIds: string[] } }>('/create',
        { preHandler: [app.authenticate] },
        async (req, reply) => {
            const { serviceId, participantIds } = req.body;
            // POST na tabela Conversation
            const conversation = await createConversation({serviceId, participantIds});

            // criar ConversationMeta “vazio”
            await prisma.conversationMeta.create({
                data: { conversationId: conversation.id, lastMessageAt: new Date(), lastMessageId: '' }
            }).catch(() => { });

            // room - adciono todos os participantes da conversa na room / sala 
            participantIds.forEach(uid => app.io.to(uid).socketsJoin?.(`conv:${conversation.id}`)); // opcional

            reply.code(201).send(conversation);
        });

    // listar conversas do usuário
    app.get('/list', { preHandler: [app.authenticate] }, async (req: any) => {
        const userId = req.user.sub as string;
        const list = await listUserConversations(userId);
        return list;
    });

    // app.delete('/delete')
    // app.put('/update')
}
