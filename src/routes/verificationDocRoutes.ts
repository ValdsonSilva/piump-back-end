import express, { Router } from 'express';
import { 
  createVerificationDocument,
  findVerificationDocumentById, 
  getAllVerificationDocuments,
  updateVerificationDocumentStatus,
  deleteVerificationDocument
} from '../repositories/verificationDocRepo.js'; // Importando as funções do repositório

const verificationDocRoutes = Router();

// Rota para criar um novo VerificationDocument
verificationDocRoutes.post('/', async (req, res) => {
  const { providerId, url } = req.body;

  // Verificação se os parâmetros necessários foram passados
  if (!providerId || !url) {
    return res.status(400).json({ error: "providerId e url são obrigatórios." });
  }

  try {
    const document = await createVerificationDocument(providerId, url);
    return res.status(201).json(document);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para obter um VerificationDocument por ID
verificationDocRoutes.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const document = await findVerificationDocumentById(id);
    if (!document) {
      return res.status(404).json({ error: "Documento de verificação não encontrado." });
    }
    return res.status(200).json(document);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para listar todos os VerificationDocuments
verificationDocRoutes.get('/', async (req, res) => {
  try {
    const documents = await getAllVerificationDocuments();
    return res.status(200).json(documents);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar o status de um VerificationDocument
verificationDocRoutes.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  // Verificação se o status foi passado e é válido
  if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    return res.status(400).json({ error: "Status inválido. Os valores válidos são 'PENDING', 'APPROVED', 'REJECTED'." });
  }

  try {
    const updatedDocument = await updateVerificationDocumentStatus(id, status);
    if (!updatedDocument) {
      return res.status(404).json({ error: "Documento de verificação não encontrado." });
    }
    return res.status(200).json(updatedDocument);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para excluir um VerificationDocument
verificationDocRoutes.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedDocument = await deleteVerificationDocument(id);
    if (!deletedDocument) {
      return res.status(404).json({ error: "Documento de verificação não encontrado." });
    }
    return res.status(200).json({ message: "Documento de verificação excluído com sucesso." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default verificationDocRoutes;
