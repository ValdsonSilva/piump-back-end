// src/modules/messages/routes.ts
import { FastifyInstance, FastifyReply } from 'fastify';
import { createMessage } from './service.js';


export async function registerMessageRoutes(app: FastifyInstance) {
    // HTTP fallback para enviar mensagem
    app.post<{ Body: { conversationId: string; content: string } }>('/create',
        { preHandler: [app.authenticate] },
        async (req: any, reply: FastifyReply) => {

            const { conversationId } = req.body;
            if (!conversationId) throw new Error('ConversationId não informado')

            try {
                // serviço de criação de mensagem
                const msg = await createMessage({
                    conversationId: conversationId,
                    content: req.body.content,
                    senderId: req.user.sub
                });

                app.io.to(`conv:${msg.conversationId}`).emit('message:new', msg);
                // return { id: msg.id, createdAt: msg.createdAt };
                reply.send({ id: msg.id, createdAt: msg.createdAt });
            } catch (erro) {
                console.log('Erro ao criar mensagem');
                throw { status: 500, message: `Erro ao criar mensagem: ${erro}` };
            }
        });

    // Socket handler — registrar uma vez ao subir o servidor
    app.io.on('connection', (socket) => {
        socket.on('message:send', async ({ conversationId, content, tempId }: any, cb?: Function) => {
            try {
                const senderId = (socket as any).userId as string;
                const msg = await createMessage({ conversationId, content, senderId });
                // ACK para quem enviou (concilia tempId)
                if (cb) cb({ ok: true, tempId, messageId: msg.id, createdAt: msg.createdAt });
                socket.emit('message:ack', { tempId, messageId: msg.id, createdAt: msg.createdAt });
                // broadcast p/ sala
                socket.to(`conv:${conversationId}`).emit('message:new', msg);
            } catch (e: any) {
                if (cb) cb({ ok: false, error: e.message });
                socket.emit('error', { scope: 'message:send', message: e.message });
            }
        });
    });
}
