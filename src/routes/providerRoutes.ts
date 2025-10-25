// src/routes/providerRoutes.ts
import { Router, Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import {
  getProviderById,
  getProviderByUserId,
  listProviders,
  createProvider,
  updateProvider,
  deleteProvider,
  approveProvider,
  matchProviders,
  addCategoriesToProvider,
  setCategoriesToProvider,
  removeCategoriesFromProvider,
  addServiceZonesToProvider,
  setServiceZonesToProvider,
  removeServiceZonesFromProvider,
  addVerificationDocument,
  updateVerificationDocument,
  listVerificationDocuments,
} from '../repositories/providerRepo.js';
import { requireAuth } from '../middleware/auth.js';

export const providerRouter = Router();

/** Wrapper para lidar com async sem duplicar try/catch */
const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) =>
    fn(req, res, next).catch(next);

/** Traduz erros comuns do Prisma para HTTP */
function handlePrismaError(err: unknown, res: Response) {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      return res
        .status(409)
        .json({ error: 'Conflict', message: 'Unique constraint violation', meta: err.meta });
    }
    if (err.code === 'P2025') {
      return res.status(404).json({ error: 'Not Found' });
    }
  }
  return res.status(500).json({ error: 'Internal Server Error' });
}

/**
 * GET /api/providers
 * Listagem com filtros: ?approved=bool&categoryId=number&zip=string&operatesAM=bool&operatesPM=bool&search=string&take=number&skip=number
 */
providerRouter.get('/', asyncHandler(async (req, res) => {
    const {
      approved,
      categoryId,
      zip,
      operatesAM,
      operatesPM,
      search,
      take,
      skip,
    } = req.query;

    const items = await listProviders({
      approved: approved !== undefined ? /^(true|1)$/i.test(String(approved)) : undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      zip: zip ? String(zip) : undefined,
      operatesAM: operatesAM !== undefined ? /^(true|1)$/i.test(String(operatesAM)) : undefined,
      operatesPM: operatesPM !== undefined ? /^(true|1)$/i.test(String(operatesPM)) : undefined,
      search: search ? String(search) : undefined,
      take: take ? Number(take) : 50,
      skip: skip ? Number(skip) : 0,
    });

    res.json(items ?? []);
  })
);

/**
 * Rota específica ANTES de /:id
 * GET /api/providers/by-user/:userId
 */
providerRouter.get(
  '/by-user/:userId',
  asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const item = await getProviderByUserId(userId);
    if (!item) return res.status(404).json({ error: 'Not Found' });
    res.json(item);
  })
);

/**
 * GET /api/providers/:id
 */
providerRouter.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const item = await getProviderById(id);
    if (!item) return res.status(404).json({ error: 'Not Found' });
    res.json(item);
  })
);

/**
 * POST /api/providers
 */
providerRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    try {
      const created = await createProvider(req.body as Prisma.ProviderCreateInput);
      res.status(201).json(created);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * PUT /api/providers/:id
 */
providerRouter.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const updated = await updateProvider(id, req.body as Prisma.ProviderUpdateInput);
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * PATCH /api/providers/:id
 */
providerRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const updated = await updateProvider(id, req.body as Prisma.ProviderUpdateInput);
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * DELETE /api/providers/:id
 */
providerRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    try {
      const deleted = await deleteProvider(id);
      res.json(deleted);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * POST /api/providers/:id/approval
 * Body: { approved: boolean }
 */
providerRouter.post(
  '/:id/approval',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { approved } = req.body as { approved?: boolean };
    try {
      const updated = await approveProvider(id, Boolean(approved));
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * GET /api/providers/match?categoryId=number&zip=string&ampm=AM|PM&take=number
 */
providerRouter.get(
  '/match/search',
  asyncHandler(async (req, res) => {
    const { categoryId, zip, ampm, take } = req.query;
    if (!categoryId || !zip || !ampm) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'categoryId, zip e ampm são obrigatórios',
      });
    }
    const items = await matchProviders({
      categoryId: Number(categoryId),
      zip: String(zip),
      ampm: String(ampm).toUpperCase() === 'AM' ? 'AM' : 'PM',
      take: take ? Number(take) : 20,
    });
    res.json(items);
  })
);

/**
 * CATEGORIAS oferecidas
 * POST   /api/providers/:id/categories        Body: { ids: number[] }  -> connect
 * PUT    /api/providers/:id/categories        Body: { ids: number[] }  -> set
 * DELETE /api/providers/:id/categories        Body: { ids: number[] }  -> disconnect
 */
providerRouter.post(
  '/:id/categories',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ids } = req.body as { ids: number[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'ids é obrigatório' });
    }
    try {
      const updated = await addCategoriesToProvider(id, ids);
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

providerRouter.put(
  '/:id/categories',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ids } = req.body as { ids: number[] };
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: 'Bad Request', message: 'ids é obrigatório' });
    }
    try {
      const updated = await setCategoriesToProvider(id, ids);
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

providerRouter.delete(
  '/:id/categories',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { ids } = req.body as { ids: number[] };
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'ids é obrigatório' });
    }
    try {
      const updated = await removeCategoriesFromProvider(id, ids);
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * ZONAS de atendimento (ZIPs)
 * POST   /api/providers/:id/zones        Body: { zips: string[] } -> connect
 * PUT    /api/providers/:id/zones        Body: { zips: string[] } -> set
 * DELETE /api/providers/:id/zones        Body: { zips: string[] } -> disconnect
 */
providerRouter.post(
  '/:id/zones',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { zips } = req.body as { zips: string[] };
    if (!Array.isArray(zips) || zips.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'zips é obrigatório' });
    }
    try {
      const updated = await addServiceZonesToProvider(id, zips);
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

providerRouter.put(
  '/:id/zones',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { zips } = req.body as { zips: string[] };
    if (!Array.isArray(zips)) {
      return res.status(400).json({ error: 'Bad Request', message: 'zips é obrigatório' });
    }
    try {
      const updated = await setServiceZonesToProvider(id, zips);
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

providerRouter.delete(
  '/:id/zones',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { zips } = req.body as { zips: string[] };
    if (!Array.isArray(zips) || zips.length === 0) {
      return res.status(400).json({ error: 'Bad Request', message: 'zips é obrigatório' });
    }
    try {
      const updated = await removeServiceZonesFromProvider(id, zips);
      res.json(updated);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

/**
 * Documentos de verificação
 * GET    /api/providers/:id/verification-docs
 * POST   /api/providers/:id/verification-docs     Body: { url: string }
 * PATCH  /api/providers/verification-docs/:docId  Body: Prisma.VerificationDocumentUpdateInput
 */
providerRouter.get(
  '/:id/verification-docs',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const docs = await listVerificationDocuments(id);
    res.json(docs);
  })
);

providerRouter.post(
  '/:id/verification-docs',
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { url } = req.body as { url?: string };
    if (!url) return res.status(400).json({ error: 'Bad Request', message: 'url é obrigatório' });
    try {
      const doc = await addVerificationDocument(id, url);
      res.status(201).json(doc);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

providerRouter.patch(
  '/verification-docs/:docId',
  asyncHandler(async (req, res) => {
    const { docId } = req.params;
    try {
      const doc = await updateVerificationDocument(docId, req.body as Prisma.VerificationDocumentUpdateInput);
      res.json(doc);
    } catch (err) {
      handlePrismaError(err, res);
    }
  })
);

export default providerRouter;
