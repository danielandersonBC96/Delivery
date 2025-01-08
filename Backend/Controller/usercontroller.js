import db from '../Config/database.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta';

// Função para criar um novo usuário
export const createUser = (name, email, password, callback) => {
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(query, [name, email, password], callback);
};

// Função para encontrar um usuário pelo email
export const findUserEmail = (email, callback) => {
    const query = `SELECT * FROM users WHERE email = ?`;
    db.get(query, [email], callback);
};

// Rota de registro
export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        findUserEmail(email, async (err, user) => {
            if (err) {
                return res.status(500).json({ message: 'Erro ao verificar email.', error: err.message });
            }
            if (user) {
                return res.status(400).json({ message: 'Email já registrado.' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            createUser(name, email, hashedPassword, (err) => {
                if (err) {
                    return res.status(500).json({ message: 'Erro ao registrar usuário.', error: err.message });
                }
                res.status(201).json({ message: 'Usuário registrado com sucesso!' });
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Erro interno.', error: err.message });
    }
};

// Rota de login
export const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    findUserEmail(email, async (err, user) => {
        if (err) {
            return res.status(500).json({ message: 'Erro ao verificar email.', error: err.message });
        }
        if (!user) {
            return res.status(404).json({ message: 'Usuário não encontrado.' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Senha inválida.' });
        }

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            message: 'Login bem-sucedido!',
            token,
            user: { id: user.id, name: user.name, email: user.email },
        });
    });
};
