import React, { useState } from 'react';
import type { SeatType } from '../../../types/cinema';

interface RoomSettingsProps {
  roomName: string;
  setRoomName: (name: string) => void;
  rows: number;
  setRows: (rows: number) => void;
  cols: number;
  setCols: (cols: number) => void;
  selectedSeatType: SeatType;
  setSelectedSeatType: (type: SeatType) => void;
}

const RoomSettings: React.FC<RoomSettingsProps> = ({
  roomName,
  setRoomName,
  rows,
  setRows,
  cols,
  setCols,
  selectedSeatType,
  setSelectedSeatType,
}) => {
  const [tempRows, setTempRows] = useState(rows);
  const [tempCols, setTempCols] = useState(cols);

  const handleApplyDimensions = () => {
    setRows(tempRows);
    setCols(tempCols);
  };

  const seatTypes: SeatType[] = ['standard', 'vip', 'couple', 'disabled', 'aisle'];

  return (
    <div className="bg-slate-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-xl font-bold text-white mb-4">Cài đặt phòng</h3>
      
      {/* Room Name */}
      <div className="mb-4">
        <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-1">
          Tên phòng
        </label>
        <input
          type="text"
          id="roomName"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent transition-all"
          placeholder="Nhập tên phòng..."
        />
      </div>
      
      {/* Room Dimensions */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-gray-300 mb-2">Kích thước phòng</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="rows" className="block text-xs text-gray-400 mb-1">
              Số hàng
            </label>
            <input
              type="number"
              id="rows"
              min="1"
              max="26" // A-Z
              value={tempRows}
              onChange={(e) => setTempRows(Math.min(26, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
          <div>
            <label htmlFor="cols" className="block text-xs text-gray-400 mb-1">
              Số cột
            </label>
            <input
              type="number"
              id="cols"
              min="1"
              max="20"
              value={tempCols}
              onChange={(e) => setTempCols(Math.min(20, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full bg-slate-700 border border-slate-600 rounded-md py-1 px-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>
        <button
          onClick={handleApplyDimensions}
          className="mt-2 w-full py-1 bg-FFD875 text-black rounded-md hover:bg-opacity-90 transition-all btn-glow btn-yellow"
          style={{ backgroundColor: '#FFD875' }}
        >
          Áp dụng kích thước
        </button>
      </div>
      
      {/* Seat Types */}
      <div>
        <h4 className="text-sm font-medium text-gray-300 mb-2">Loại ghế</h4>
        <div className="grid grid-cols-3 gap-2">
          {seatTypes.map((type) => (
            <button
              key={type}
              onClick={() => setSelectedSeatType(type)}
              className={`py-2 px-1 text-xs rounded-md transition-all ${
                selectedSeatType === type
                  ? 'bg-FFD875 text-black font-medium btn-glow'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
              style={selectedSeatType === type ? { backgroundColor: '#FFD875' } : {}}
            >
              {type === 'standard' && 'Ghế thường'}
              {type === 'vip' && 'Ghế VIP'}
              {type === 'couple' && 'Ghế đôi'}
              {type === 'disabled' && 'Ghế người khuyết tật'}
              {type === 'aisle' && 'Lối đi'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Instructions */}
      <div className="mt-6 p-3 bg-slate-700 rounded-md">
        <h4 className="text-sm font-medium text-FFD875 mb-1" style={{ color: '#FFD875' }}>Hướng dẫn:</h4>
        <ul className="text-xs text-gray-300 space-y-1 list-disc pl-4">
          <li>Chọn loại ghế từ menu trên</li>
          <li>Nhấp vào ghế trên sơ đồ để thay đổi loại ghế</li>
          <li>Ghế đôi sẽ chiếm 2 vị trí</li>
          <li>Lối đi không có ghế</li>
        </ul>
      </div>
    </div>
  );
};

export default RoomSettings; 