import express from 'express';
import {
  createZipWhitelist,
  getAllZipWhitelists,
  getZipWhitelistByZip,
  updateZipWhitelist,
  deleteZipWhitelist,
  getActiveZipWhitelists,
} from '../repositories/zipListRepo.js'; // Importando o repositório

const zipListRouter = express.Router();

// Rota para criar um novo ZipWhitelist
zipListRouter.post('/', async (req, res) => {
  const { zip, city, state } = req.body;

  if (!zip) {
    return res.status(400).json({ error: "O CEP é obrigatório." });
  }

  try {
    const newZip = await createZipWhitelist(zip, city, state);
    return res.status(201).json(newZip);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para buscar todos os ZipWhitelists
zipListRouter.get('/', async (req, res) => {
  try {
    const zipWhitelists = await getAllZipWhitelists();
    return res.status(200).json(zipWhitelists);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um ZipWhitelist por zip (CEP)
zipListRouter.get('/:zip', async (req, res) => {
  const { zip } = req.params;

  try {
    const zipWhitelist = await getZipWhitelistByZip(zip);
    if (!zipWhitelist) {
      return res.status(404).json({ error: "ZipWhitelist não encontrado." });
    }
    return res.status(200).json(zipWhitelist);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar um ZipWhitelist
zipListRouter.put('/:zip', async (req, res) => {
  const { zip } = req.params;
  const { city, state, active } = req.body;

  try {
    const updatedZip = await updateZipWhitelist(zip, city, state, active);
    if (!updatedZip) {
      return res.status(404).json({ error: "ZipWhitelist não encontrado." });
    }
    return res.status(200).json(updatedZip);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para excluir um ZipWhitelist
zipListRouter.delete('/:zip', async (req, res) => {
  const { zip } = req.params;

  try {
    const deletedZip = await deleteZipWhitelist(zip);
    if (!deletedZip) {
      return res.status(404).json({ error: "ZipWhitelist não encontrado." });
    }
    return res.status(200).json({ message: "ZipWhitelist excluído com sucesso." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para buscar todos os ZipWhitelists ativos
zipListRouter.get('/active', async (req, res) => {
  try {
    const activeZipWhitelists = await getActiveZipWhitelists();
    return res.status(200).json(activeZipWhitelists);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default zipListRouter;
