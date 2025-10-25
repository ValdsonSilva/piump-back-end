import { Router } from "express";
import { 
  createServiceCategory, 
  findServiceCategoryById, 
  getAllServiceCategories, 
  updateServiceCategory, 
  deleteServiceCategory 
} from "../repositories/serviceCategoryRepo.js"; // Importando as funções do repositório

const serviceCategoryRouter = Router();

// Rota para criar uma nova categoria de serviço
serviceCategoryRouter.post("/", async (req, res) => {
  const { name, slug } = req.body;
  
  if (!name || !slug) {
    return res.status(400).json({ error: "Name and slug are required" });
  }

  try {
    const newCategory = await createServiceCategory(name, slug);
    return res.status(201).json(newCategory);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para obter todas as categorias de serviço
serviceCategoryRouter.get("/", async (req, res) => {
  try {
    const categories = await getAllServiceCategories();
    return res.status(200).json(categories);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para obter uma categoria de serviço por ID
serviceCategoryRouter.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const category = await findServiceCategoryById(Number(id));
    if (!category) {
      return res.status(404).json({ error: "Service category not found" });
    }
    return res.status(200).json(category);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar uma categoria de serviço
serviceCategoryRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, slug } = req.body;

  if (!name || !slug) {
    return res.status(400).json({ error: "Name and slug are required" });
  }

  try {
    const updatedCategory = await updateServiceCategory(Number(id), name, slug);
    if (!updatedCategory) {
      return res.status(404).json({ error: "Service category not found" });
    }
    return res.status(200).json(updatedCategory);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para excluir uma categoria de serviço
serviceCategoryRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deletedCategory = await deleteServiceCategory(Number(id));
    if (!deletedCategory) {
      return res.status(404).json({ error: "Service category not found" });
    }
    return res.status(200).json({ message: "Service category deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default serviceCategoryRouter;
