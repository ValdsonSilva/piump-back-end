import express from 'express';
import {
  createBooking,
  getAllBookings,
  getBookingById,
  updateBooking,
  deleteBooking,
  getBookingsByStatus,
  getBookingsByRequesterId,
  // getBookingsByProviderId,
} from '../repositories/bookinRepo.js'; // Importando o repositório
import { BookingStatus } from '@prisma/client';

const router = express.Router();

// Rota para criar um novo Booking
router.post('/', async (req, res) => {
  const { bookingCode, requesterId, categoryId, serviceZip, ampm, sameDay, status, assignedDate, providerId } = req.body;

  if (!bookingCode || !requesterId || !categoryId || !serviceZip || !ampm || !status) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes: bookingCode, requesterId, categoryId, serviceZip, ampm, status." });
  }

  try {
    const newBooking = await createBooking(bookingCode, requesterId, categoryId, serviceZip, ampm, sameDay, status, assignedDate, providerId);
    return res.status(201).json(newBooking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para buscar todos os Bookings
router.get('/', async (req, res) => {
  try {
    const bookings = await getAllBookings();
    return res.status(200).json(bookings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para buscar um Booking por ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const booking = await getBookingById(id);
    if (!booking) {
      return res.status(404).json({ error: "Booking não encontrado." });
    }
    return res.status(200).json(booking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para atualizar um Booking
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { providerId, assignedDate, status } = req.body;

  try {
    const updatedBooking = await updateBooking(id, providerId, assignedDate, status);
    if (!updatedBooking) {
      return res.status(404).json({ error: "Booking não encontrado." });
    }
    return res.status(200).json(updatedBooking);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para excluir um Booking
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBooking = await deleteBooking(id);
    if (!deletedBooking) {
      return res.status(404).json({ error: "Booking não encontrado." });
    }
    return res.status(200).json({ message: "Booking excluído com sucesso." });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para buscar Bookings por status
router.get('/status/:status', async (req, res) => {
  const { status } = req.params;

  try {
    if (status in BookingStatus) {
      const bookings = await getBookingsByStatus(status as BookingStatus);
      return res.status(200).json(bookings);
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para buscar Bookings do requester
router.get('/requester/:requesterId', async (req, res) => {
  const { requesterId } = req.params;

  try {
    const bookings = await getBookingsByRequesterId(requesterId);
    return res.status(200).json(bookings);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// Rota para buscar Bookings do provider
// router.get('/provider/:providerId', async (req, res) => {
//   const { providerId } = req.params;

//   try {
      // 
//     const bookings = await getBookingsByProviderId(providerId);
//     return res.status(200).json(bookings);
//   } catch (error: any) {
//     return res.status(500).json({ error: error.message });
//   }
// });

export default router;
