// utils/seatRecommendations.ts
import type { Seat, CinemaRoom } from '../types';

export const findBestSeats = (
  room: CinemaRoom, 
  requestedSeats: number,
  preferences: {
    preferCenter: boolean;
    preferMiddleRows: boolean;
    avoidFrontRows: boolean;
    avoidBackRows: boolean;
  } = {
    preferCenter: true,
    preferMiddleRows: true,
    avoidFrontRows: true,
    avoidBackRows: false
  }
): Seat[] => {
  const availableSeats = room.layout.flat().filter(seat => seat.status === 'available');
  
  if (availableSeats.length < requestedSeats) {
    return [];
  }

  // Score seats based on preferences
  const scoredSeats = availableSeats.map(seat => {
    let score = 0;
    const rowIndex = seat.row.charCodeAt(0) - 65;
    const totalRows = room.rows;
    const seatsInRow = room.seatsPerRow[rowIndex];
    
    // Center preference
    if (preferences.preferCenter) {
      const centerSeat = Math.floor(seatsInRow / 2);
      const distanceFromCenter = Math.abs(seat.number - centerSeat);
      score += (seatsInRow - distanceFromCenter) * 2;
    }
    
    // Middle rows preference
    if (preferences.preferMiddleRows) {
      const middleRow = Math.floor(totalRows / 2);
      const distanceFromMiddle = Math.abs(rowIndex - middleRow);
      score += (totalRows - distanceFromMiddle) * 3;
    }
    
    // Avoid front rows
    if (preferences.avoidFrontRows && rowIndex < 2) {
      score -= 50;
    }
    
    // Avoid back rows
    if (preferences.avoidBackRows && rowIndex > totalRows - 3) {
      score -= 30;
    }
    
    // VIP seats get bonus
    if (seat.type === 'vip') {
      score += 20;
    }
    
    return { seat, score };
  });

  // Sort by score and find consecutive seats
  scoredSeats.sort((a, b) => b.score - a.score);
  
  // Try to find consecutive seats
  for (let i = 0; i < scoredSeats.length; i++) {
    const startSeat = scoredSeats[i].seat;
    const consecutiveSeats = findConsecutiveSeats(
      room, 
      startSeat, 
      requestedSeats
    );
    
    if (consecutiveSeats.length === requestedSeats) {
      return consecutiveSeats;
    }
  }
  
  // If no consecutive seats found, return best individual seats
  return scoredSeats.slice(0, requestedSeats).map(item => item.seat);
};

const findConsecutiveSeats = (
  room: CinemaRoom, 
  startSeat: Seat, 
  count: number
): Seat[] => {
  const rowIndex = startSeat.row.charCodeAt(0) - 65;
  const row = room.layout[rowIndex];
  const startIndex = row.findIndex(seat => seat.id === startSeat.id);
  
  if (startIndex === -1 || startIndex + count > row.length) {
    return [];
  }
  
  const consecutiveSeats = [];
  for (let i = 0; i < count; i++) {
    const seat = row[startIndex + i];
    if (seat.status !== 'available') {
      return [];
    }
    consecutiveSeats.push(seat);
  }
  
  return consecutiveSeats;
};

// utils/localStorage.ts
export const saveBookingSession = (session: any) => {
  try {
    localStorage.setItem('bookingSession', JSON.stringify(session));
  } catch (error) {
    console.error('Failed to save booking session:', error);
  }
};

export const loadBookingSession = () => {
  try {
    const session = localStorage.getItem('bookingSession');
    return session ? JSON.parse(session) : null;
  } catch (error) {
    console.error('Failed to load booking session:', error);
    return null;
  }
};

export const clearBookingSession = () => {
  try {
    localStorage.removeItem('bookingSession');
  } catch (error) {
    console.error('Failed to clear booking session:', error);
  }
};

// Tạo một lưới ghế mẫu cho phòng chiếu
export const generateSeatGrid = (rows: number, seatsPerRow: number[]): CinemaRoom => {
  const layout: Seat[][] = [];
  let seatId = 1;
  
  for (let i = 0; i < rows; i++) {
    const rowChar = String.fromCharCode(65 + i); // A, B, C, ...
    const rowSeats: Seat[] = [];
    
    const seatsInThisRow = seatsPerRow[i] || 10;
    const emptySeatsOnLeft = Math.floor((16 - seatsInThisRow) / 2);
    
    // Add empty seats on the left for centering
    for (let e = 0; e < emptySeatsOnLeft; e++) {
      rowSeats.push({
        id: `empty-${rowChar}-${e}`,
        row: rowChar,
        number: 0,
        type: 'standard',
        status: 'maintenance',
        price: 0,
        position: { x: e, y: i }
      });
    }
    
    for (let j = 0; j < seatsInThisRow; j++) {
      const seatNumber = j + 1;
      
      // Determine seat type based on position
      let seatType: 'standard' | 'vip' | 'couple' | 'wheelchair' = 'standard';
      
      // Middle rows and middle seats are VIP
      if (i >= 2 && i <= rows - 3 && j >= Math.floor(seatsInThisRow / 4) && j < seatsInThisRow - Math.floor(seatsInThisRow / 4)) {
        seatType = 'vip';
      }
      
      // Some couple seats in the back rows (every third seat)
      // For couple seats, we'll skip the next position to create space for the wider seat
      if (i === rows - 1 && (j % 3 === 0)) {
        seatType = 'couple';
        // Skip the next position for couple seats
        if (j < seatsInThisRow - 1) {
          j++; // Skip the next position
        }
      }
      
      // Remove wheelchair seats as requested
      if ((i === 0 || i === rows - 1) && (j === 0 || j === seatsInThisRow - 1)) {
        seatType = 'standard'; // Changed from 'wheelchair' to 'standard'
      }
      
      // Randomly mark some seats as occupied (about 20%)
      const status = Math.random() < 0.2 ? 'occupied' : 'available';
      
      rowSeats.push({
        id: `${rowChar}${seatNumber}`,
        row: rowChar,
        number: seatNumber,
        type: seatType,
        status: status,
        price: getSeatPrice(seatType),
        position: { x: emptySeatsOnLeft + j, y: i }
      });
      
      seatId++;
    }
    
    // Add empty seats on the right for centering
    for (let e = 0; e < emptySeatsOnLeft; e++) {
      rowSeats.push({
        id: `empty-${rowChar}-right-${e}`,
        row: rowChar,
        number: 0,
        type: 'standard',
        status: 'maintenance',
        price: 0,
        position: { x: emptySeatsOnLeft + seatsInThisRow + e, y: i }
      });
    }
    
    layout.push(rowSeats);
  }
  
  return {
    id: 'room-1',
    name: 'Phòng chiếu 1',
    type: 'standard',
    totalSeats: layout.flat().filter(seat => seat.status !== 'maintenance').length,
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
