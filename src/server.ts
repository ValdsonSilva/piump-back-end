// src/server.ts
import Fastify from 'fastify';
import cors from '@fastify/cors';
import fastifyJwt from '@fastify/jwt';
import { createServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { prisma } from './db/prisma.js';
import { registerConversationRoutes } from './modules/conversations/routes.js';
import { registerMessageRoutes } from './modules/messages/routes.js';
import { registerReceiptRoutes } from './modules/receipts/routes.js';
import { startOutboxConsumer } from './modules/outbox/consumer.js';
import { registerConversationSocket } from './modules/conversations/socket.js';

startOutboxConsumer();

const app = Fastify({ logger: true });

app.register(cors, { origin: true });
app.register(fastifyJwt, { secret: process.env.JWT_SECRET! });

// auth decorator
app.decorate('authenticate', async (request: any) => {
  try {
    await request.jwtVerify();
  } catch (erro) {
    throw new Error('Not authorized')
  }
});

// HTTP server + Socket.IO
const httpServer = createServer(app as any);
const io = new IOServer(httpServer, {
  cors: { origin: true }
});

// associa socket ao fastify para uso em rotas/serviços
app.decorate('io', io);

// lifecycle do socket
io.use(async (socket, next) => {
  // auth via token no query ou header
  const token = socket.handshake.auth?.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
  if (!token) return next(new Error('unauthorized'));
  try {
    const payload: any = app.jwt.verify(token);
    (socket as any).userId = payload.sub;
    next();
  } catch {
    next(new Error('unauthorized'));
  }
});

io.on('connection', (socket) => {
  const userId = (socket as any).userId as string;

  // entrar em todas as conversas do usuário (para receber eventos)
  // (opcional: paginar se for muitas)
  prisma.conversationParticipant.findMany({ where: { userId }, select: { conversationId: true } })
    .then(rows => rows.forEach(r => socket.join(`conv:${r.conversationId}`)));

  // indicadores simples (typing/presence)
  socket.on('typing', ({ conversationId, isTyping }: { conversationId: string, isTyping: boolean }) => {
    socket.to(`conv:${conversationId}`).emit('typing', { userId, isTyping });
  });
});

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: any;
    io: IOServer;
  }
}

app.register(registerConversationRoutes, { prefix: '/conversations' });
app.register(registerMessageRoutes, { prefix: '/messages' });
app.register(registerReceiptRoutes, { prefix: '/receipts' });
registerConversationSocket(app);

const port = Number(process.env.PORT) || 8080;
httpServer.listen(port, '0.0.0.0', () => {
  app.log.info(`HTTP+WS runnig on :${port}`);
});
