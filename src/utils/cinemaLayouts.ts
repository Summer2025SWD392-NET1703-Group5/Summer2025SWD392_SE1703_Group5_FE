// utils/cinemaLayouts.ts
import type { CinemaRoom, Seat } from '../types';

export const generateCinemaRoom = (
  id: string, 
  name: string, 
  type: 'standard' | 'premium' | 'imax',
  config: {
    rows: number;
    seatsPerRow: number[];
    vipRows?: number[];
    coupleRows?: number[];
    wheelchairSeats?: { row: number; seats: number[] }[];
  }
): CinemaRoom => {
  const layout: Seat[][] = [];
  let seatId = 1;

  for (let rowIndex = 0; rowIndex < config.rows; rowIndex++) {
    const row: Seat[] = [];
    const rowLetter = String.fromCharCode(65 + rowIndex);
    const seatsInRow = config.seatsPerRow[rowIndex] || config.seatsPerRow[0];
    
    for (let seatNumber = 1; seatNumber <= seatsInRow; seatNumber++) {
      let seatType: 'regular' | 'vip' | 'couple' | 'wheelchair' = 'regular';
      let price = 80000; // Base price

      // Determine seat type
      if (config.vipRows?.includes(rowIndex)) {
        seatType = 'vip';
        price = 150000;
      } else if (config.coupleRows?.includes(rowIndex) && seatNumber % 2 === 1) {
        seatType = 'couple';
        price = 200000;
      } else if (config.wheelchairSeats?.some(w => w.row === rowIndex && w.seats.includes(seatNumber))) {
        seatType = 'wheelchair';
        price = 80000;
      }

      // Random occupied seats (simulation)
      const isOccupied = Math.random() < 0.3; // 30% occupied

      const seat: Seat = {
        id: `${id}-${seatId++}`,
        row: rowLetter,
        number: seatNumber,
        type: seatType,
        status: isOccupied ? 'occupied' : 'available',
        price,
        position: { x: seatNumber, y: rowIndex }
      };

      row.push(seat);
    }
    
    layout.push(row);
  }

  return {
    id,
    name,
    type,
    totalSeats: layout.flat().length,
    rows: config.rows,
    seatsPerRow: config.seatsPerRow,
    layout,
    screenPosition: 'front'
  };
};

// Predefined cinema rooms
export const cinemaRooms: CinemaRoom[] = [
  // Standard Room
  generateCinemaRoom('room-1', 'Phòng 1 - Standard', 'standard', {
    rows: 10,
    seatsPerRow: [16, 16, 16, 16, 18, 18, 18, 18, 20, 20],
    vipRows: [4, 5, 6],
    wheelchairSeats: [{ row: 9, seats: [1, 2, 19, 20] }]
  }),

  // Premium Room
  generateCinemaRoom('room-2', 'Phòng 2 - Premium', 'premium', {
    rows: 8,
    seatsPerRow: [12, 12, 14, 14, 16, 16, 16, 16],
    vipRows: [2, 3, 4, 5],
    coupleRows: [6, 7],
    wheelchairSeats: [{ row: 0, seats: [1, 2] }]
  }),

  // IMAX Room
  generateCinemaRoom('room-3', 'Phòng 3 - IMAX', 'imax', {
    rows: 15,
    seatsPerRow: [20, 22, 24, 24, 26, 26, 28, 28, 28, 26, 26, 24, 24, 22, 20],
    vipRows: [6, 7, 8, 9],
    coupleRows: [10, 11],
    wheelchairSeats: [
      { row: 0, seats: [1, 2, 19, 20] },
      { row: 14, seats: [9, 10, 11, 12] }
    ]
  })
];

// Tạo layout cho một phòng chiếu thường
export const createStandardRoom = (): CinemaRoom => {
  const rows = 10;
  const seatsPerRow = [14, 14, 16, 16, 18, 18, 20, 20, 20, 16];
  const layout: Seat[][] = [];
  
  for (let i = 0; i < rows; i++) {
    const rowChar = String.fromCharCode(65 + i); // A, B, C, ...
    const rowSeats: Seat[] = [];
    
    for (let j = 0; j < seatsPerRow[i]; j++) {
      const seatNumber = j + 1;
      
      // Determine seat type based on position
      let seatType: 'standard' | 'vip' | 'couple' | 'wheelchair' = 'standard';
      
      // Middle rows and middle seats are VIP
      if (i >= 2 && i <= 6 && j >= Math.floor(seatsPerRow[i] / 4) && j < seatsPerRow[i] - Math.floor(seatsPerRow[i] / 4)) {
        seatType = 'vip';
      }
      
      // Some couple seats in the back
      if (i === rows - 1 && (j % 4 === 0 || j % 4 === 1) && j < seatsPerRow[i] - 2) {
        seatType = j % 4 === 0 ? 'couple' : 'standard';
      }
      
      // Wheelchair accessible seats on the sides
      if ((i === 0 || i === rows - 1) && (j === 0 || j === seatsPerRow[i] - 1)) {
        seatType = 'wheelchair';
      }
      
      // Randomly mark some seats as occupied (about 20%)
      const status = Math.random() < 0.2 ? 'occupied' : 'available';
      
      rowSeats.push({
        id: `${rowChar}${seatNumber}`,
        row: rowChar,
        number: seatNumber,
        type: seatType,
        status: status,
        price: getSeatPrice(seatType)
      });
    }
    
    layout.push(rowSeats);
  }
  
  return {
    id: 'room-standard',
    name: 'Phòng chiếu thường',
    type: 'standard',
    totalSeats: layout.flat().length,
    rows: rows,
    seatsPerRow: seatsPerRow,
    layout: layout,
    screenPosition: 'center'
  };
};

// Tạo layout cho một phòng chiếu VIP
export const createVIPRoom = (): CinemaRoom => {
  const rows = 8;
  const seatsPerRow = [10, 12, 12, 14, 14, 14, 12, 10];
  const layout: Seat[][] = [];
  
  for (let i = 0; i < rows; i++) {
    const rowChar = String.fromCharCode(65 + i); // A, B, C, ...
    const rowSeats: Seat[] = [];
    
    for (let j = 0; j < seatsPerRow[i]; j++) {
      const seatNumber = j + 1;
      
      // In VIP room, most seats are VIP
      let seatType: 'standard' | 'vip' | 'couple' | 'wheelchair' = 'vip';
      
      // Couple seats in the back
      if (i >= rows - 2 && (j % 2 === 0) && j < seatsPerRow[i] - 1) {
        seatType = 'couple';
      }
      
      // Standard seats on the sides
      if (j === 0 || j === seatsPerRow[i] - 1) {
        seatType = 'standard';
      }
      
      // Wheelchair accessible seats
      if (i === 0 && (j === 0 || j === seatsPerRow[i] - 1)) {
        seatType = 'wheelchair';
      }
      
      // Randomly mark some seats as occupied (about 30% for VIP room)
      const status = Math.random() < 0.3 ? 'occupied' : 'available';
      
      rowSeats.push({
        id: `${rowChar}${seatNumber}`,
        row: rowChar,
        number: seatNumber,
        type: seatType,
        status: status,
        price: getSeatPrice(seatType)
      });
    }
    
    layout.push(rowSeats);
  }
  
  return {
    id: 'room-vip',
    name: 'Phòng chiếu VIP',
    type: 'premium',
    totalSeats: layout.flat().length,
    rows: rows,
    seatsPerRow: seatsPerRow,
    layout: layout,
    screenPosition: 'center'
  };
};

// Tạo layout cho một phòng chiếu IMAX
export const createIMAXRoom = (): CinemaRoom => {
  const rows = 12;
  const seatsPerRow = [16, 18, 20, 20, 22, 22, 24, 24, 24, 22, 20, 18];
  const layout: Seat[][] = [];
  
  for (let i = 0; i < rows; i++) {
    const rowChar = String.fromCharCode(65 + i); // A, B, C, ...
    const rowSeats: Seat[] = [];
    
    for (let j = 0; j < seatsPerRow[i]; j++) {
      const seatNumber = j + 1;
      
      // Determine seat type based on position
      let seatType: 'standard' | 'vip' | 'couple' | 'wheelchair' = 'standard';
      
      // Middle rows are VIP
      if (i >= 3 && i <= 8) {
        seatType = 'vip';
      }
      
      // Couple seats in the back
      if (i >= rows - 3 && (j % 4 === 0 || j % 4 === 1) && j < seatsPerRow[i] - 2) {
        seatType = j % 4 === 0 ? 'couple' : 'standard';
      }
      
      // Wheelchair accessible seats
      if ((i === 0 || i === rows - 1) && (j === 0 || j === seatsPerRow[i] - 1)) {
        seatType = 'wheelchair';
      }
      
      // Randomly mark some seats as occupied (about 40% for IMAX)
      const status = Math.random() < 0.4 ? 'occupied' : 'available';
      
      rowSeats.push({
        id: `${rowChar}${seatNumber}`,
        row: rowChar,
        number: seatNumber,
        type: seatType,
        status: status,
        price: getSeatPrice(seatType)
      });
    }
    
    layout.push(rowSeats);
  }
  
  return {
    id: 'room-imax',
    name: 'Phòng chiếu IMAX',
    type: 'imax',
    totalSeats: layout.flat().length,
    rows: rows,
    seatsPerRow: seatsPerRow,
    layout: layout,
    screenPosition: 'center'
  };
};

// Tính giá ghế dựa trên loại
const getSeatPrice = (type: 'standard' | 'vip' | 'couple' | 'wheelchair'): number => {
  switch (type) {
    case 'vip':
      return 120000;
    case 'couple':
      return 200000;
    case 'wheelchair':
      return 90000;
    default:
      return 90000;
  }
};
