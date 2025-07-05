// Ticket Pricing Types
export interface TicketPricing {
  Price_ID?: number | string;
  Room_Type: string;
  Seat_Type: string;
  Base_Price: number;
  Status: 'Active' | 'Inactive' | 'Deleted';
  Created_Date?: string;
  Last_Updated?: string;
  total_seats_of_type?: number;
  used_in_rooms?: Array<{
    room_name: string;
    seat_count: number;
  }>;
}

export interface TicketPricingGroup {
  room_type: string;
  seat_types: Array<{
    Price_ID: number;
    Seat_Type: string;
    Base_Price: number;
    Status: string;
    Created_Date: string;
    Last_Updated: string;
  }>;
}

export interface PricingStructure {
  basePrices: {
    [roomType: string]: {
      [seatType: string]: number;
    };
  };
  dayTypes: {
    [dayType: string]: {
      multiplier: number;
      description: string;
    };
  };
  timeSlots: {
    [slot: string]: {
      startTime: string;
      endTime: string;
      multiplier: number;
      description: string;
    };
  };
  holidays: string[];
}

export interface SeatType {
  seat_type: string;
  usage_count: number;
  average_price: number;
}

export interface PriceCalculation {
  roomType: string;
  seatType: string;
  showDate: string;
  startTime: string;
  basePrice: number;
  dayMultiplier: number;
  timeMultiplier: number;
  finalPrice: number;
  breakdown: {
    dayType: string;
    timeSlot: string;
    isHoliday: boolean;
  };
}

export interface BulkPriceUpdate {
  Price_ID: number | string;
  Base_Price: number;
}

export interface CreateTicketPricingRequest {
  Room_Type: string;
  Seat_Type: string;
  Base_Price: number;
}

export interface UpdateTicketPricingRequest {
  Room_Type?: string;
  Seat_Type?: string;
  Base_Price?: number;
  Status?: 'Active' | 'Inactive' | 'Deleted';
}
