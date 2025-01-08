import express from 'express';
import { register, login } from '../Controller/usercontroller.js';

const router = express.Router();

// Rotas relacionadas a usuários
router.post('/register', register);
router.post('/login', login);

export default router; // Exportação padrão
