import { PrismaClient, ServiceCategory } from '@prisma/client';

// Instanciando o Prisma Client
const prisma = new PrismaClient();

// Função para criar uma nova categoria de serviço
export const createServiceCategory = async (name: string, slug: string): Promise<ServiceCategory> => {
  try {
    const serviceCategory = await prisma.serviceCategory.create({
      data: {
        name,
        slug,
      },
    });
    return serviceCategory;
  } catch (error: any) {
    throw new Error(`Erro ao criar categoria de serviço: ${error.message}`);
  }
};

// Função para encontrar uma categoria de serviço por ID
export const findServiceCategoryById = async (id: number): Promise<ServiceCategory | null> => {
  try {
    const serviceCategory = await prisma.serviceCategory.findUnique({
      where: {
        id,
      },
    });
    return serviceCategory;
  } catch (error: any) {
    throw new Error(`Erro ao buscar categoria de serviço: ${error.message}`);
  }
};

// Função para buscar uma categoria de serviço por slug
export const findServiceCategoryBySlug = async (slug: string): Promise<ServiceCategory | null> => {
  try {
    const serviceCategory = await prisma.serviceCategory.findUnique({
      where: {
        slug,
      },
    });
    return serviceCategory;
  } catch (error: any) {
    throw new Error(`Erro ao buscar categoria de serviço: ${error.message}`);
  }
};

// Função para listar todas as categorias de serviço
export const getAllServiceCategories = async (): Promise<ServiceCategory[]> => {
  try {
    const serviceCategories = await prisma.serviceCategory.findMany();
    return serviceCategories;
  } catch (error: any) {
    throw new Error(`Erro ao listar categorias de serviço: ${error.message}`);
  }
};

// Função para atualizar uma categoria de serviço
export const updateServiceCategory = async (id: number, name: string, slug: string): Promise<ServiceCategory> => {
  try {
    const serviceCategory = await prisma.serviceCategory.update({
      where: { id },
      data: {
        name,
        slug,
      },
    });
    return serviceCategory;
  } catch (error: any) {
    throw new Error(`Erro ao atualizar categoria de serviço: ${error.message}`);
  }
};

// Função para excluir uma categoria de serviço
export const deleteServiceCategory = async (id: number): Promise<ServiceCategory> => {
  try {
    const serviceCategory = await prisma.serviceCategory.delete({
      where: { id },
    });
    return serviceCategory;
  } catch (error: any) {
    throw new Error(`Erro ao excluir categoria de serviço: ${error.message}`);
  }
};
