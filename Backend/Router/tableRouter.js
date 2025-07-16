import express from 'express';
import {
  createTable,
  getAllTables,
  updateTable,
  deleteTable,
  seedTables, // ✅ Importação da função que popula 50 mesas
} from '../Controller/tableController.js';

const router = express.Router();

// Criar nova mesa
router.post('/createTable', createTable);

// Buscar todas as mesas
router.get('/', getAllTables);

// Atualizar mesa por ID
router.put('/:id', updateTable);

// Deletar mesa por ID
router.delete('/:id', deleteTable);

// Popular 50 mesas automaticamente (seed)
router.post('/seed', seedTables); // ✅ Rota para popular com 50 mesas aleatórias

export default router;
