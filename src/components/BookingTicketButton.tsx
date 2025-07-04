import React from 'react';
import { Link } from 'react-router-dom';
import { Ticket } from 'lucide-react';

interface BookingTicketButtonProps {
    href: string;
}

const BookingTicketButton: React.FC<BookingTicketButtonProps> = ({ href }) => {
    return (
        <>
            <style>
                {`
          .ticket-btn {
            perspective: 800px;
          }
          .ticket-btn-inner {
            transform-style: preserve-3d;
            transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
            transform: rotateX(0deg) rotateY(0deg);
          }
          .ticket-btn:hover .ticket-btn-inner {
            transform: rotateX(-15deg) rotateY(10deg);
            filter: brightness(1.1);
          }
          .ticket-face {
            background: linear-gradient(135deg, #FFD875, #FBBF24);
            box-shadow: 0 0 20px rgba(255, 216, 117, 0.5), 
                        inset 0 0 5px rgba(0,0,0,0.2);
            position: relative;
            overflow: hidden;
            border-left: 2px dashed rgba(0,0,0,0.2);
          }
        `}
            </style>
            <Link to={href} className="ticket-btn group block">
                <div className="ticket-btn-inner">
                    <div className="ticket-face rounded-lg flex items-center justify-center gap-3 px-8 py-4">
                        <Ticket className="w-7 h-7 text-black/80 transition-transform group-hover:rotate-[-15deg]" />
                        <span className="text-black font-bold text-lg uppercase tracking-wide">Đặt vé ngay</span>
                    </div>
                </div>
            </Link>
        </>
    );
};

export default BookingTicketButton; 