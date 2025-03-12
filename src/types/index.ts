export interface Location {
  lat: number;
  lng: number;
}

export interface ParkingSpace {
  id: string;
  location: Location;
  status: 'available' | 'booked' | 'expiring';
  currentBooking?: {
    userId: string;
    startTime: Date;
    endTime: Date;
    paymentStatus: 'pending' | 'completed';
  };
  pricePerHour: number;
  spaceNumber: string;
}

export interface Booking {
  id: string;
  spaceId: string;
  userId: string;
  startTime: Date;
  endTime: Date;
  paymentDetails: {
    mpesaTransactionId: string;
    amount: number;
    status: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  activeBookings?: string[]; // Array of booking IDs
}

export interface PaymentTransaction {
  id: string;
  bookingId: string;
  amount: number;
  mpesaTransactionId: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: Date;
} 