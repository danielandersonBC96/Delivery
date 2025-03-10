import express from 'express';
import { createFood, getAllFoods, getFoodById, updateFood, deleteFood } from '../Controller/foodcontroller.js'
import { upload } from '../Config/multer.js'; // middleware do multer

const router = express.Router();

// Rota para adicionar um novo alimento
router.post('/', upload.single('image'), createFood)

// Rota para listar todos os alimentos
router.get('/', getAllFoods);

// Rota para obter um alimento pelo ID
router.get('/:productId', getFoodById);

// Rota para atualizar um alimento pelo ID
router.put('/:id', upload.single('image'), updateFood);

// Rota para deletar um alimento pelo ID
router.delete('/name/:name', deleteFood);


export default router;
