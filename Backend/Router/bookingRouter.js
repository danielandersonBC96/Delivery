import express from 'express';
import {
  getBookingById,
  deleteBooking,
  getAllBookings,
  updatebooking,
  createBooking
} from '../Controller/bookingController.js';

const router = express.Router();


// Rota para criar reservas 

router.post('/', createBooking)

// Rota para listar todas as reservas
router.get('/', getAllBookings);

// Rota para buscar uma reserva específica
router.get('/:id', getBookingById);

// Rota para atualizar uma reserva
router.put('/:id', updatebooking);

// Rota para deletar uma reserva
router.delete('/:id', deleteBooking);



export default router;
