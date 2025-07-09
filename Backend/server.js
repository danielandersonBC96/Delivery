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
import categoryRoutes from  './Router/categoryRouter.js'

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Cria o servidor HTTP para ser usado pelo socket.io e express
const server = http.createServer(app);

// Configura o Socket.io com CORS liberado para seu front-end
// Configura o Socket.io com CORS liberado para seu front-end
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', // ✅ Porta correta do Vite
    methods: ['GET', 'POST']
  }
});


// Para permitir que seus controllers emitam eventos, você pode guardar o 'io' no app locals
app.set('io', io);

// Middlewares
app.use(express.json());
app.use(cors());

// Servir uploads estáticos
app.use('/uploads', express.static(path.join(__dirname, 'Config', 'Uploads')));

// Rotas da API
app.get('/', (req, res) => {
  res.send('API Working com Socket.io');
});

app.use('/api', orderRoutes);
app.use('/api/foods', foodRoutes);
app.use('/users', userRoutes);
app.use('/category', categoryRoutes);

// Middleware para rotas não encontradas
app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada' });
});

// Socket.io conexão
io.on('connection', (socket) => {
  console.log('Novo cliente conectado via WebSocket:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Função para notificar novos pedidos
export const notifyNewOrder = (order) => {
  io.emit('newOrder', order); // Envia o evento para todos os clientes conectados
};

// Inicializa o servidor HTTP + Socket.io
server.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
