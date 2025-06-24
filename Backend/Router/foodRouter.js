import express from 'express';
import {
  createFood,
  getAllFoods,
  getFoodById,
  updateFood,
  deleteFood
} from '../Controller/foodcontroller.js';
import { upload } from '../Config/multer.js'; // Middleware de upload

const router = express.Router();

// ✅ Criar novo alimento (com upload de imagem)
router.post('/', upload.single('image'), createFood);

// ✅ Buscar todos os alimentos
router.get('/', getAllFoods);

// ✅ Buscar alimento por ID
router.get('/:id', getFoodById);

// ✅ Atualizar alimento por ID (com upload opcional de nova imagem)
router.put('/:id', upload.single('image'), updateFood);

// ✅ Deletar alimento por nome (cuidado: esse tipo de deleção por nome pode ser perigoso se tiver nomes duplicados)
router.delete('/name/:name', deleteFood);

export default router;
