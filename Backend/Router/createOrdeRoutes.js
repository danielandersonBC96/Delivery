import express from 'express';
import {
  createOrder,
  createOrderItem,
  getOrderItems,
  getUserOrders,
  getAllOrders  // ✅ Nova função para listar todos os pedidos
} from '../Controller/orderController.js';
import { authenticateToken } from '../Middleware/authtenticationToken.js';

const router = express.Router();

// Criar pedido (rota protegida)
router.post('/orders', authenticateToken, createOrder);

// Obter pedidos do usuário autenticado
router.get('/orders/user', authenticateToken, getUserOrders);

// Obter todos os pedidos (Admin) - ✅ Sem autenticação
router.get('/foods-admin', getAllOrders);

// Criar item de pedido
router.post('/order-items', createOrderItem);

// Obter itens de um pedido específico
router.get('/order-items/:order_id', getOrderItems);

export default router;

