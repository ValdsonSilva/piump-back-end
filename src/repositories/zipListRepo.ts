import { PrismaClient, ZipWhitelist } from '@prisma/client';

// Instanciando o Prisma Client
const prisma = new PrismaClient();

// Função para criar um novo ZipWhitelist
export const createZipWhitelist = async (zip: string, city?: string, state?: string): Promise<ZipWhitelist> => {
  try {
    const newZip = await prisma.zipWhitelist.create({
      data: {
        zip,
        city,
        state,
      },
    });
    return newZip;
  } catch (error: any) {
    throw new Error(`Erro ao criar ZipWhitelist: ${error.message}`);
  }
};

// Função para buscar todos os ZipWhitelists
export const getAllZipWhitelists = async (): Promise<ZipWhitelist[]> => {
  try {
    const zipWhitelists = await prisma.zipWhitelist.findMany();
    return zipWhitelists;
  } catch (error: any) {
    throw new Error(`Erro ao buscar todos os ZipWhitelists: ${error.message}`);
  }
};

// Função para buscar um ZipWhitelist por zip
export const getZipWhitelistByZip = async (zip: string): Promise<ZipWhitelist | null> => {
  try {
    const zipWhitelist = await prisma.zipWhitelist.findUnique({
      where: { zip },
    });
    return zipWhitelist;
  } catch (error: any) {
    throw new Error(`Erro ao buscar ZipWhitelist pelo CEP: ${error.message}`);
  }
};

// Função para atualizar um ZipWhitelist
export const updateZipWhitelist = async (zip: string, city?: string, state?: string, active?: boolean): Promise<ZipWhitelist> => {
  try {
    const updatedZip = await prisma.zipWhitelist.update({
      where: { zip },
      data: {
        city,
        state,
        active,  // Se fornecido, o estado ativo será alterado
      },
    });
    return updatedZip;
  } catch (error: any) {
    throw new Error(`Erro ao atualizar ZipWhitelist: ${error.message}`);
  }
};

// Função para excluir um ZipWhitelist
export const deleteZipWhitelist = async (zip: string): Promise<ZipWhitelist> => {
  try {
    const deletedZip = await prisma.zipWhitelist.delete({
      where: { zip },
    });
    return deletedZip;
  } catch (error: any) {
    throw new Error(`Erro ao excluir ZipWhitelist: ${error.message}`);
  }
};

// Função para buscar todos os ZipWhitelists ativos
export const getActiveZipWhitelists = async (): Promise<ZipWhitelist[]> => {
  try {
    const activeZipWhitelists = await prisma.zipWhitelist.findMany({
      where: { active: true },
    });
    return activeZipWhitelists;
  } catch (error: any) {
    throw new Error(`Erro ao buscar ZipWhitelists ativos: ${error.message}`);
  }
};
