import express from 'express';
import {
  createOrder,
  createOrderItem,
  getOrderItems,
  getUserOrders,

} from '../Controller/orderController.js'
import  { authenticateToken } from '../Middleware/authtenticationToken.js';

const router = express.Router();

// Rota protegida para criar pedido
router.post('/orders', authenticateToken, createOrder);

// Obter pedidos do usuário autenticado
router.get('/orders/user', authenticateToken, getUserOrders);

// Criar item de pedido (se necessário proteger, adicione verifyToken)
router.post('/order-items', createOrderItem);

// Obter itens de um pedido específico
router.get('/order-items/:order_id',getOrderItems);

export default router;
