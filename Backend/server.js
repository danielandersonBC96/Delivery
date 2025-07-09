import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

import db from './Config/database.js';
import foodRoutes from './Router/foodRouter.js';
import userRoutes from './Router/userRoutes.js';
import orderRoutes from './Router/createOrdeRoutes.js';
import categoryRoutes from './Router/categoryRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Cria o servidor HTTP para o Express e Socket.io
const server = http.createServer(app);

// Lista de origens permitidas (local + produção)
const allowedOrigins = [
  'http://localhost:5173',
  'https://delivery-br1d.vercel.app',
];

// Configuração do Socket.IO com CORS liberado
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Permitir acesso ao objeto io em qualquer lugar da aplicação
app.set('io', io);

// Middlewares
app.use(express.json());
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Servir imagens e arquivos de upload
app.use('/uploads', express.static(path.join(__dirname, 'Config', 'Uploads')));

// Rotas principais
app.get('/', (req, res) => {
  res.send('API Working com Socket.io');
});

app.use('/api', orderRoutes);
app.use('/api/foods', foodRoutes);
app.use('/users', userRoutes);
app.use('/category', categoryRoutes);

// Middleware de rota não encontrada
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Socket.io: escutando conexões
io.on('connection', (socket) => {
  console.log('Novo cliente conectado via WebSocket:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Função para emitir eventos de novos pedidos
export const notifyNewOrder = (order) => {
  io.emit('newOrder', order);
};

// Iniciar o servidor
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
