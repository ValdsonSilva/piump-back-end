import { Prisma, Provider, VerificationDocument } from '@prisma/client';
import { prisma } from '../services/db.js';

// ------- Helpers comuns -------
const defaultInclude = {
  categoriesOffered: true,
  serviceZones: true,
  verificationDocs: true,
} satisfies Prisma.ProviderInclude;

// ------- CRUD básico -------
export async function getProviderById(
  id: string,
  opts?: { include?: Prisma.ProviderInclude }
): Promise<Provider & { categoriesOffered: any[]; serviceZones: any[]; verificationDocs: VerificationDocument[] } | null> {
  return prisma.provider.findUnique({
    where: { id },
    include: opts?.include ?? defaultInclude,
  });
}

export async function getProviderByUserId(
  userId: string,
  opts?: { include?: Prisma.ProviderInclude }
) {
  return prisma.provider.findUnique({
    where: { userId },
    include: opts?.include ?? defaultInclude,
  });
}

export async function listProviders(params?: {
  approved?: boolean;
  categoryId?: number;
  zip?: string;
  operatesAM?: boolean;
  operatesPM?: boolean;
  search?: string; // busca por companyName/city/state
  take?: number;
  skip?: number;
  orderBy?: Prisma.ProviderOrderByWithRelationInput;
  include?: Prisma.ProviderInclude;
}) {
  const {
    approved,
    categoryId,
    zip,
    operatesAM,
    operatesPM,
    search,
    take = 50,
    skip = 0,
    orderBy = { createdAt: 'desc' },
    include = defaultInclude,
  } = params ?? {};

  return prisma.provider.findMany({
    where: {
      ...(approved !== undefined ? { approved } : {}),
      ...(operatesAM !== undefined ? { operatesAM } : {}),
      ...(operatesPM !== undefined ? { operatesPM } : {}),
      ...(categoryId
        ? { categoriesOffered: { some: { id: categoryId } } }
        : {}),
      ...(zip ? { serviceZones: { some: { zip } } } : {}),
      ...(search
        ? {
            OR: [
              { companyName: { contains: search, mode: 'insensitive' } },
              { city: { contains: search, mode: 'insensitive' } },
              { state: { contains: search, mode: 'insensitive' } },
              { zip: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include,
    take,
    skip,
    orderBy,
  });
}

export async function createProvider(
  data: Prisma.ProviderCreateInput,
  opts?: { include?: Prisma.ProviderInclude }
) {
  return prisma.provider.create({
    data,
    include: opts?.include ?? defaultInclude,
  });
}

export async function updateProvider(
  id: string,
  data: Prisma.ProviderUpdateInput,
  opts?: { include?: Prisma.ProviderInclude }
) {
  return prisma.provider.update({
    where: { id },
    data,
    include: opts?.include ?? defaultInclude,
  });
}

export async function deleteProvider(id: string) {
  return prisma.provider.delete({
    where: { id },
  });
}

// ------- Aprovação -------
export async function approveProvider(id: string, approved = true) {
  return prisma.provider.update({
    where: { id },
    data: { approved },
    include: defaultInclude,
  });
}

// ------- Matching para receber pedidos -------
// Encontra providers aprovados por categoria + CEP + janela AM/PM
export async function matchProviders(params: {
  categoryId: number;
  zip: string;
  ampm: 'AM' | 'PM';
  take?: number;
}) {
  const { categoryId, zip, ampm, take = 20 } = params;
  const ampmFilter =
    ampm === 'AM' ? { operatesAM: true } : { operatesPM: true };

  return prisma.provider.findMany({
    where: {
      approved: true,
      ...ampmFilter,
      categoriesOffered: { some: { id: categoryId } },
      serviceZones: { some: { zip } },
    },
    include: defaultInclude,
    take,
    orderBy: { createdAt: 'asc' }, // ajuste a estratégia de priorização conforme sua regra
  });
}

// ------- Gestão de categorias oferecidas -------
export async function addCategoriesToProvider(
  providerId: string,
  categoryIds: number[]
) {
  return prisma.provider.update({
    where: { id: providerId },
    data: {
      categoriesOffered: {
        connect: categoryIds.map((id) => ({ id })),
      },
    },
    include: defaultInclude,
  });
}

export async function setCategoriesToProvider(
  providerId: string,
  categoryIds: number[]
) {
  return prisma.provider.update({
    where: { id: providerId },
    data: {
      categoriesOffered: {
        set: categoryIds.map((id) => ({ id })),
      },
    },
    include: defaultInclude,
  });
}

export async function removeCategoriesFromProvider(
  providerId: string,
  categoryIds: number[]
) {
  return prisma.provider.update({
    where: { id: providerId },
    data: {
      categoriesOffered: {
        disconnect: categoryIds.map((id) => ({ id })),
      },
    },
    include: defaultInclude,
  });
}

// ------- Gestão de zonas de atendimento (ZIPs) -------
export async function addServiceZonesToProvider(
  providerId: string,
  zips: string[]
) {
  return prisma.provider.update({
    where: { id: providerId },
    data: {
      serviceZones: {
        connect: zips.map((zip) => ({ zip })),
      },
    },
    include: defaultInclude,
  });
}

export async function setServiceZonesToProvider(
  providerId: string,
  zips: string[]
) {
  return prisma.provider.update({
    where: { id: providerId },
    data: {
      serviceZones: {
        set: zips.map((zip) => ({ zip })),
      },
    },
    include: defaultInclude,
  });
}

export async function removeServiceZonesFromProvider(
  providerId: string,
  zips: string[]
) {
  return prisma.provider.update({
    where: { id: providerId },
    data: {
      serviceZones: {
        disconnect: zips.map((zip) => ({ zip })),
      },
    },
    include: defaultInclude,
  });
}

// ------- Documentos de verificação (helpers práticos) -------
export async function addVerificationDocument(
  providerId: string,
  url: string
): Promise<VerificationDocument> {
  return prisma.verificationDocument.create({
    data: { provider: { connect: { id: providerId } }, url },
  });
}

export async function updateVerificationDocument(
  docId: string,
  data: Prisma.VerificationDocumentUpdateInput
) {
  return prisma.verificationDocument.update({
    where: { id: docId },
    data,
  });
}

export async function listVerificationDocuments(providerId: string) {
  return prisma.verificationDocument.findMany({
    where: { providerId },
    orderBy: { uploadedAt: 'desc' },
  });
}
