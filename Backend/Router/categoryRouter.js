import express from 'express';
import {
  createCategory,
  deleteCategory,
   getAllCategories ,
  renameCategory
} from '../Controller/categoryController.js';
import { upload } from '../Config/multer.js';

const router = express.Router();
router.delete('/delete-category/:category', deleteCategory);
router.get('/get-category', getAllCategories);
router.put('/update-category', renameCategory);

// Novo endpoint para criar categoria com imagem
router.post('/create-category', upload.single('image'), createCategory);

export default router;
