import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import foodRoutes from './Router/foodRouter.js';
import userRoutes from './Router/userRoutes.js';
import orderRoutes from './Router/createOrdeRoutes.js';
import categoryRoutes from './Router/categoryRouter.js';
import tableRoutes from './Router/tableRouter.js';
import bookingRoutes from './Router/bookingRouter.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 4000;

// Cria o servidor HTTP para o Express e Socket.io
const server = http.createServer(app);

// Lista de origens permitidas (local + produção)
const allowedOrigins = [
  'http://localhost:5173',           // Frontend local para desenvolvimento
  'https://delivery-br1d.vercel.app' // Frontend produção
];

// Configuração do Socket.IO com CORS liberado para as origens permitidas
const io = new Server(server, {
  cors: {
    origin: function(origin, callback) {
      if (!origin) return callback(null, true); // permitir chamadas sem origem (ex: Postman)
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `A política de CORS bloqueou a origem ${origin}.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  }
});

// Permitir acesso ao objeto io em qualquer lugar da aplicação
app.set('io', io);

// Middlewares
app.use(express.json());
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `A política de CORS bloqueou a origem ${origin}.`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
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
app.use('/tables', tableRoutes);
app.use('/booking', bookingRoutes);

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
