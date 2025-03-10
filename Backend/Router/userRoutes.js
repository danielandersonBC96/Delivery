import express from 'express';
import { register, login } from '../Controller/usercontroller.js';
import { authenticateToken } from '../Middleware/authtenticationToken.js';

const router = express.Router();

// Rotas relacionadas a usuários
router.post('/register' , register);
router.post('/login', login);

// Rota protegida que exige autenticação
router.get('/profile', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'Acesso ao perfil permitido', userId: req.userId });
});

// Endpoint para verificar se o token é válido
router.get('/verify-token', authenticateToken, (req, res) => {
    // Se chegou aqui, o token é válido
    res.status(200).json({ message: 'Token válido', userId: req.userId });
});


export default router; // Exportação padrão
