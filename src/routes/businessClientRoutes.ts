import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import {
  findBusinessClientById,
  findBusinessClientByUserId,
  listAllBusinessClients,
  createBusinessClient,
  updateBusinessClient,
  deleteBusinessClient,
} from '../repositories/BusinessRepo.js';

const businessClientRouter = Router();

/** Helper para tratar async/await sem repetir try/catch em cada rota */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

/** Formata erros comuns do Prisma em respostas HTTP legíveis */
function handlePrismaError(err: unknown, res: Response) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // Unique constraint
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Unique constraint violation.',
        meta: err.meta,
      });
    }
    // Not found em updates/deletes
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
  }
  return res.status(500).json({ error: 'Internal Server Error' });
}

/**
 * GET /api/business-clients
 * Lista todos os perfis BusinessClient
 */
businessClientRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const items = await listAllBusinessClients();
    res.json(items ?? []);
  })
);

/**
 * ⚠️ IMPORTANTE: defina rotas específicas ANTES de rotas com :id
 * GET /api/business-clients/by-user/:userId
 * Busca perfil pelo userId
 */
businessClientRouter.get(
  '/by-user/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const item = await findBusinessClientByUserId(userId);
    if (!item) return res.status(404).json({ error: 'Not Found' });
    res.json(item);
  })
);

/**
 * GET /api/business-clients/:id
 * Busca perfil pelo id do BusinessClientProfile
 */
businessClientRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await findBusinessClientById(id);
    if (!item) return res.status(404).json({ error: 'Not Found' });
    res.json(item);
  })
);

/**
 * POST /api/business-clients
 * Cria um novo perfil BusinessClient
 */
businessClientRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    // req.body deve respeitar Prisma.BusinessClientProfileCreateInput
    try {
      const created = await createBusinessClient(
        req.body as Prisma.BusinessClientProfileCreateInput
      );
      res.status(201).json(created);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * PUT /api/business-clients/:id
 * Atualiza integralmente um perfil (use PATCH para parcial)
 */
businessClientRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const updated = await updateBusinessClient(
        id,
        req.body as Prisma.BusinessClientProfileUpdateInput
      );
      if (!updated) return res.status(404).json({ error: 'Not Found' });
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * PATCH /api/business-clients/:id
 * Atualiza parcialmente um perfil
 */
businessClientRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const updated = await updateBusinessClient(
        id,
        req.body as Prisma.BusinessClientProfileUpdateInput
      );
      if (!updated) return res.status(404).json({ error: 'Not Found' });
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * DELETE /api/business-clients/:id
 * Exclui um perfil
 */
businessClientRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await deleteBusinessClient(id);
      res.json(deleted);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

export default businessClientRouter;
