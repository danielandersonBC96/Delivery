import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();  // Carrega as variáveis de ambiente do arquivo .env

export const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];  // O token deve ser enviado no header Authorization
    const token = authHeader && authHeader.split(' ')[1];  // Formato: "Bearer <token>"

    if (!token) {
        return res.status(401).json({ message: 'Token não fornecido. Usuário não autenticado.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido.' });
        }

        req.userId = user.id;  // Armazenamos o ID do usuário para uso nas rotas protegidas
        next();  // Permite que a requisição continue para a próxima função
    });
};
