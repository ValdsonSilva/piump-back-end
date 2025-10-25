import { PrismaClient, VerificationDocument } from '@prisma/client';

// Instanciando o Prisma Client
const prisma = new PrismaClient();

// Função para criar um novo VerificationDocument
export const createVerificationDocument = async (providerId: string, url: string): Promise<VerificationDocument> => {
  try {
    const document = await prisma.verificationDocument.create({
      data: {
        providerId,
        url,
        status: "PENDING",  // O status inicial é "PENDING"
      },
    });
    return document;
  } catch (error: any) {
    throw new Error(`Erro ao criar documento de verificação: ${error.message}`);
  }
};

// Função para buscar um VerificationDocument pelo ID
export const findVerificationDocumentById = async (id: string): Promise<VerificationDocument | null> => {
  try {
    const document = await prisma.verificationDocument.findUnique({
      where: { id },
    });
    return document;
  } catch (error: any) {
    throw new Error(`Erro ao buscar documento de verificação: ${error.message}`);
  }
};

// Função para listar todos os VerificationDocuments
export const getAllVerificationDocuments = async (): Promise<VerificationDocument[]> => {
  try {
    const documents = await prisma.verificationDocument.findMany();
    return documents;
  } catch (error: any) {
    throw new Error(`Erro ao listar documentos de verificação: ${error.message}`);
  }
};

// Função para atualizar o status de um VerificationDocument
export const updateVerificationDocumentStatus = async (id: string, status: string): Promise<VerificationDocument> => {
  try {
    const updatedDocument = await prisma.verificationDocument.update({
      where: { id },
      data: { status },
    });
    return updatedDocument;
  } catch (error: any) {
    throw new Error(`Erro ao atualizar status do documento de verificação: ${error.message}`);
  }
};

// Função para excluir um VerificationDocument
export const deleteVerificationDocument = async (id: string): Promise<VerificationDocument> => {
  try {
    const deletedDocument = await prisma.verificationDocument.delete({
      where: { id },
    });
    return deletedDocument;
  } catch (error: any) {
    throw new Error(`Erro ao excluir documento de verificação: ${error.message}`);
  }
};
