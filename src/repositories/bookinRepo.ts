import { PrismaClient, Booking, AMPM, BookingStatus } from '@prisma/client';
import { getGeolocation } from '../services/googleMapApi';

// Instanciando o Prisma Client
const prisma = new PrismaClient();

// Função para criar um novo Booking
export const createBooking = async (
  bookingCode: string,
  requesterId: string,
  categoryId: number,
  serviceZip: string,
  ampm: AMPM,
  sameDay: boolean,
  status: BookingStatus,
  assignedDate?: Date,
  providerId?: string
): Promise<Booking> => {
  try {
    const newBooking = await prisma.booking.create({
      data: {
        bookingCode,
        requesterId,
        categoryId,
        serviceZip,
        ampm,
        sameDay,
        status,
        assignedDate,
        providerId,
      },
    });
    return newBooking;
  } catch (error: any) {
    throw new Error(`Erro ao criar booking: ${error.message}`);
  }
};

// Função para buscar todos os Bookings
export const getAllBookings = async (): Promise<Booking[]> => {
  try {
    const bookings = await prisma.booking.findMany();
    return bookings;
  } catch (error: any) {
    throw new Error(`Erro ao buscar todos os bookings: ${error.message}`);
  }
};

// Função para buscar um Booking por ID
export const getBookingById = async (id: string): Promise<Booking | null> => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
    });
    return booking;
  } catch (error: any) {
    throw new Error(`Erro ao buscar booking por ID: ${error.message}`);
  }
};

// Função para buscar Bookings por status
export const getBookingsByStatus = async (status: BookingStatus): Promise<Booking[]> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { status },
    });
    return bookings;
  } catch (error: any) {
    throw new Error(`Erro ao buscar bookings por status: ${error.message}`);
  }
};

// Função para atualizar um Booking
export const updateBooking = async (
  id: string,
  providerId?: string,
  assignedDate?: Date,
  status?: BookingStatus
): Promise<Booking> => {
  try {
    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        providerId,
        assignedDate,
        status,
      },
    });
    return updatedBooking;
  } catch (error: any) {
    throw new Error(`Erro ao atualizar booking: ${error.message}`);
  }
};

// Função para excluir um Booking
export const deleteBooking = async (id: string): Promise<Booking> => {
  try {
    const deletedBooking = await prisma.booking.delete({
      where: { id },
    });
    return deletedBooking;
  } catch (error: any) {
    throw new Error(`Erro ao excluir booking: ${error.message}`);
  }
};

// Função para buscar bookings do requester
export const getBookingsByRequesterId = async (requesterId: string): Promise<Booking[]> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { requesterId },
    });
    return bookings;
  } catch (error: any) {
    throw new Error(`Erro ao buscar bookings do requester: ${error.message}`);
  }
};

// Função para buscar bookings do provider ( retorno inteligente de rotas )
// export const getBookingsByProviderId = async (providerId: string, lastBookingZip: string): Promise<Booking[]> => {
//   try {
//     // Obter todas as reservas do provedor
//     const bookings = await prisma.booking.findMany({
//       where: { providerId },
//     });

//     // Obter as coordenadas geográficas para o `lastBookingZip` (último serviço solicitado)
//     const lastBookingCoordinates = await getGeolocation(lastBookingZip);

//     // Ordenar as reservas com base na distância
//     const sortedBookings = bookings.sort((a, b) => {
//       const distA = haversine(
//         lastBookingCoordinates.latitude,
//         lastBookingCoordinates.longitude,
//         a.latitude,
//         a.longitude
//       );
//       const distB = haversine(
//         lastBookingCoordinates.latitude,
//         lastBookingCoordinates.longitude,
//         b.latitude,
//         b.longitude
//       );

//       return distA - distB; // Ordenando de forma crescente (menor distância primeiro)
//     });

//     return sortedBookings;
//   } catch (error: any) {
//     throw new Error(`Erro ao buscar bookings por providerId: ${error.message}`);
//   }
// };


// Função para buscar bookings por data de agendamento e status
export const getBookingsByAssignedDateAndStatus = async (assignedDate: Date, status: BookingStatus): Promise<Booking[]> => {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        assignedDate,
        status,
      },
    });
    return bookings;
  } catch (error: any) {
    throw new Error(`Erro ao buscar bookings por data e status: ${error.message}`);
  }
};

