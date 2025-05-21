import db from '../Config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config(); // ⚠️ ESSENCIAL para carregar o .env

// Verifica se a variável de ambiente está definida
if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET não definido no arquivo .env');
}

const JWT_SECRET = process.env.JWT_SECRET;

// Função para criar um novo usuário
export const createUser = (name, email, password) => {
    return new Promise((resolve, reject) => {
        const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
        db.run(query, [name, email, password], function (err) {
            if (err) return reject(err);
            resolve(this.lastID);  // Retorna o ID do usuário inserido
        });
    });
};

// Função para encontrar um usuário pelo email
export const findUserEmail = (email) => {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        db.get(query, [email], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
};

// Rota de registro
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const user = await findUserEmail(email);
        if (user) {
            return res.status(400).json({ message: 'Email já registrado.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await createUser(name, email, hashedPassword);
        res.status(201).json({ message: 'Usuário registrado com sucesso!', userId });
    } catch (err) {
        res.status(500).json({ message: 'Erro interno.', error: err.message });
    }
};

// Rota de login
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const user = await findUserEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha inválida.' });
        }

        // Gerar o token JWT com o ID do usuário
        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

        res.json({
            message: 'Login bem-sucedido!',
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    } catch (err) {
        res.status(500).json({ message: 'Erro interno.', error: err.message });
    }
};
