import React, { useState, useEffect } from "react";
import api from "../../config/axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiAlertTriangle,
  FiGrid,
  FiLayout,
  FiInfo,
  FiCheck,
  FiCheckSquare,
  FiSquare,
  FiEye,
} from "react-icons/fi";
import { motion } from "framer-motion";
import "./ManageCinemaRoom.css";

// Interface definitions
interface CinemaRoomResponse {
  Cinema_Room_ID: number;
  Room_Name: string;
  Seat_Quantity: number;
  Room_Type: string;
  Status: string;
  Notes: string;
  HasUpcomingShowtimes: boolean;
  Created_At?: string;
  Updated_At?: string | null;
}

interface CinemaRoomRequest {
  RoomName: string;
  Capacity: number;
  RoomType: string;
  Description: string;
  Status: string;
}

interface Seat {
  Layout_ID: number;
  Row_Label: string;
  Column_Number: number;
  Seat_Type: string;
  Is_Active: boolean;
}

interface Row {
  Row: string;
  Seats: Seat[];
}

interface SeatLayout {
  cinema_room: {
    Cinema_Room_ID: number;
    Room_Name: string;
    Room_Type: string;
  };
  rows: Row[];
  dimensions: {
    rows: number;
    columns: number;
  };
  stats: {
    total_seats: number;
    seat_types: { SeatType: string; Count: number }[];
  };
  can_modify: boolean;
}

interface CinemaResponse {
  success: boolean;
  data: {
    Cinema_Name: string;
    Address: string;
    City: string;
    Province: string;
    Phone_Number: string;
    Email: string;
    Description: string;
    Status: string;
    rooms?: CinemaRoomResponse[];
  };
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

// Modal Component
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = "md",
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "modal-sm",
    md: "modal-md",
    lg: "modal-lg",
    xl: "modal-xl",
  };

  return (
    <div className="modal-overlay">
      <div className={`modal-content ${sizeClasses[size]}`}>
        <button onClick={onClose} className="modal-close-button">
          <FiX className="modal-close-icon" />
        </button>
        {children}
      </div>
    </div>
  );
};

// Main Component
const ManageCinemaRoom: React.FC = () => {
  const [cinemaRooms, setCinemaRooms] = useState<CinemaRoomResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [isUpdatingRoom, setIsUpdatingRoom] = useState(false);
  const [currentRoomId, setCurrentRoomId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [isCreatingSeatLayout, setIsCreatingSeatLayout] = useState(false);
  const [isViewingSeatLayout, setIsViewingSeatLayout] = useState(false);
  const [seatLayout, setSeatLayout] = useState<SeatLayout | null>(null);
  const [isLoadingSeatLayout, setIsLoadingSeatLayout] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const [isBulkSelecting, setIsBulkSelecting] = useState(false);
  const [bulkSeatType, setBulkSeatType] = useState<string>("Regular");
  const [bulkIsActive, setBulkIsActive] = useState<boolean>(true);
  const [rowsInput, setRowsInput] = useState("");
  const [columnsPerRow, setColumnsPerRow] = useState(0);
  const [seatType, setSeatType] = useState("Regular");
  const [emptyColumns, setEmptyColumns] = useState<number[]>([]);
  const [emptyColumnsInput, setEmptyColumnsInput] = useState("");
  const [overwriteExisting, setOverwriteExisting] = useState(false);
  const [newRoom, setNewRoom] = useState<Partial<CinemaRoomRequest>>({
    RoomName: "",
    Capacity: 0,
    RoomType: "",
    Description: "",
    Status: "Active",
  });
  const [roomSeatLayoutStatus, setRoomSeatLayoutStatus] = useState<{
    [roomId: number]: boolean;
  }>({});
  const [cinemaInfo, setCinemaInfo] = useState<{
    Cinema_Name: string;
    Address: string;
    City: string;
    Province: string;
    Phone_Number: string;
    Email: string;
    Description: string;
    Status: string;
  } | null>(null);

  const navigate = useNavigate();

  // Authentication helpers
  const getRole = () => {
    return localStorage.getItem("role") || sessionStorage.getItem("role");
  };

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // Check access rights
  useEffect(() => {
    const role = getRole();
    if (role !== "Admin" && role !== "Staff" && role !== "Manager") {
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/");
    }
  }, [navigate]);

  // Fetch cinema rooms
  const fetchCinemaRooms = async () => {
    setLoading(true);
    setError(null);
    const token = getToken();
    if (!token) {
      setError("Không tìm thấy token. Vui lòng đăng nhập!");
      toast.error("Không tìm thấy token. Vui lòng đăng nhập lại!");
      setLoading(false);
      return;
    }

    try {
      const response = await api.get<CinemaResponse>(
        "/cinemas/manager/my-cinema",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.data) {
        // Store cinema information
        setCinemaInfo({
          Cinema_Name: response.data.data.Cinema_Name,
          Address: response.data.data.Address,
          City: response.data.data.City,
          Province: response.data.data.Province,
          Phone_Number: response.data.data.Phone_Number,
          Email: response.data.data.Email,
          Description: response.data.data.Description,
          Status: response.data.data.Status,
        });

        if (response.data.data.rooms) {
          const sortedRooms = response.data.data.rooms.sort(
            (a, b) => b.Cinema_Room_ID - a.Cinema_Room_ID
          );
          setCinemaRooms(sortedRooms);

          const seatLayoutStatus: { [roomId: number]: boolean } = {};
          await Promise.all(
            sortedRooms.map(async (room) => {
              try {
                const layoutResponse = await api.get(
                  `/seat-layouts/room/${room.Cinema_Room_ID}`,
                  {
                    headers: { Authorization: `Bearer ${token}` },
                  }
                );
                seatLayoutStatus[room.Cinema_Room_ID] =
                  layoutResponse.data &&
                  layoutResponse.data.data &&
                  layoutResponse.data.data.rows &&
                  layoutResponse.data.data.rows.length > 0;
              } catch (error) {
                seatLayoutStatus[room.Cinema_Room_ID] = false;
              }
            })
          );

          setRoomSeatLayoutStatus(seatLayoutStatus);
        } else {
          setCinemaRooms([]);
          setRoomSeatLayoutStatus({});
        }
      } else {
        setError("Không tìm thấy thông tin rạp chiếu.");
        toast.error("Không tìm thấy thông tin rạp chiếu!");
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Đã xảy ra lỗi khi tải dữ liệu.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fetch seat layout
  const fetchSeatLayout = async (roomId: number) => {
    setIsLoadingSeatLayout(true);
    setSeatLayout(null);
    const token = getToken();
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại!");
      setIsLoadingSeatLayout(false);
      return;
    }

    try {
      const response = await api.get(`/seat-layouts/room/${roomId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.data && response.data.data.cinema_room) {
        setSeatLayout(response.data.data);
        setIsViewingSeatLayout(true);
        setRoomSeatLayoutStatus((prev) => ({
          ...prev,
          [roomId]: response.data.data.rows && response.data.data.rows.length > 0,
        }));
      } else {
        throw new Error("Dữ liệu bố cục ghế không hợp lệ hoặc không tồn tại.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tải bố cục ghế.";
      toast.error(`Lỗi: ${errorMessage}`);
      setSeatLayout(null);
      setIsViewingSeatLayout(false);
      setRoomSeatLayoutStatus((prev) => ({
        ...prev,
        [roomId]: false,
      }));
    } finally {
      setIsLoadingSeatLayout(false);
    }
  };

  // Create seat layout
  const handleCreateSeatLayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoomId) {
      toast.error("Vui lòng chọn phòng chiếu!");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại!");
      return;
    }

    const selectedRoom = cinemaRooms.find(
      (room) => room.Cinema_Room_ID === currentRoomId
    );
    if (!selectedRoom) {
      toast.error("Không tìm thấy phòng chiếu!");
      return;
    }

    let totalRows = 0;
    if (rowsInput.includes("-")) {
      const [start, end] = rowsInput.split("-").map((char) => char.trim());
      if (start.length === 1 && end.length === 1) {
        const startCode = start.charCodeAt(0);
        const endCode = end.charCodeAt(0);
        if (startCode <= endCode) {
          totalRows = endCode - startCode + 1;
        }
      }
    } else {
      totalRows = rowsInput.split(",").length;
    }

    const totalColumns = columnsPerRow;
    const calculatedSeats = totalRows * totalColumns;

    if (!overwriteExisting && calculatedSeats !== selectedRoom.Seat_Quantity) {
      toast.error(
        `Tổng số ghế (${calculatedSeats}) phải bằng sức chứa phòng (${selectedRoom.Seat_Quantity}).`
      );
      return;
    }

    if (!rowsInput.trim()) {
      toast.error("Nhãn hàng là bắt buộc.");
      return;
    }
    if (columnsPerRow <= 0) {
      toast.error("Số cột phải lớn hơn 0.");
      return;
    }

    try {
      const payload = {
        RowsInput: rowsInput.trim(),
        ColumnsPerRow: columnsPerRow,
        SeatType: seatType,
        EmptyColumns: emptyColumns.length > 0 ? emptyColumns : [],
        OverwriteExisting: overwriteExisting,
      };

      await api.post(`/seat-layouts/bulk/${currentRoomId}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Tạo bố cục ghế thành công!");
      fetchSeatLayout(currentRoomId);
      setIsCreatingSeatLayout(false);
      setRoomSeatLayoutStatus((prev) => ({
        ...prev,
        [currentRoomId!]: true,
      }));
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo bố cục ghế.";
      toast.error(errorMessage);
    }
  };

  // Delete seat layout
  const handleDeleteSeatLayout = async () => {
    if (!seatLayout) {
      toast.error("Không có bố cục ghế để xóa!");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại!");
      return;
    }

    if (!window.confirm("Bạn có chắc chắn muốn xóa toàn bộ bố cục ghế?")) {
      return;
    }

    try {
      const LayoutIds = seatLayout.rows.flatMap((row) =>
        row.Seats.map((seat) => seat.Layout_ID)
      );

      if (LayoutIds.length === 0) {
        toast.warn("Không tìm thấy ghế nào để xóa.");
        return;
      }

      await api.delete("/seat-layouts/bulk-delete", {
        headers: { Authorization: `Bearer ${token}` },
        data: { LayoutIds },
      });

      toast.success("Xóa bố cục ghế thành công!");
      setIsViewingSeatLayout(false);
      setSeatLayout(null);
      setSelectedSeats([]);
      if (currentRoomId) {
        setRoomSeatLayoutStatus((prev) => ({
          ...prev,
          [currentRoomId]: false,
        }));
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa bố cục ghế.";
      toast.error(errorMessage);
    }
  };

  // Update individual seat status
  const updateSeatStatus = async (
    layoutId: number,
    currentIsActive: boolean
  ) => {
    const token = getToken();
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      const seat = seatLayout?.rows
        .flatMap((row) => row.Seats)
        .find((s) => s.Layout_ID === layoutId);

      if (!seat) {
        toast.error("Không tìm thấy ghế!");
        return;
      }

      const updatedSeatPayload = {
        seatType: seat.Seat_Type,
        isActive: !currentIsActive,
      };

      await api.put(`/seat-layouts/${layoutId}/seat-type`, updatedSeatPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSeatLayout((prevLayout) => {
        if (!prevLayout) return null;
        const updatedRows = prevLayout.rows.map((row) => ({
          ...row,
          Seats: row.Seats.map((s) =>
            s.Layout_ID === layoutId ? { ...s, Is_Active: !currentIsActive } : s
          ),
        }));
        return {
          ...prevLayout,
          rows: updatedRows,
        };
      });

      toast.success(
        `Cập nhật trạng thái ghế ${seat.Row_Label}${seat.Column_Number} thành công!`
      );
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật trạng thái ghế.";
      toast.error(errorMessage);
    }
  };

  // Bulk update seats
  const bulkUpdateSeats = async () => {
    if (selectedSeats.length === 0) {
      toast.warn("Vui lòng chọn ít nhất một ghế để cập nhật!");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      const formattedSeatType = bulkSeatType.toUpperCase();

      const payload = {
        LayoutIds: selectedSeats,
        SeatType: formattedSeatType,
        IsActive: bulkIsActive,
      };

      const response = await api.put("/seat-layouts/bulk-update-types", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data && response.data.success !== false) {
        setSeatLayout((prevLayout) => {
          if (!prevLayout) return null;
          const updatedRows = prevLayout.rows.map((row) => ({
            ...row,
            Seats: row.Seats.map((s) =>
              selectedSeats.includes(s.Layout_ID)
                ? { ...s, Seat_Type: formattedSeatType, Is_Active: bulkIsActive }
                : s
            ),
          }));
          return {
            ...prevLayout,
            rows: updatedRows,
          };
        });

        toast.success(`Cập nhật ${selectedSeats.length} ghế thành công!`);
        setSelectedSeats([]);
        setIsBulkSelecting(false);
      } else {
        throw new Error(response.data?.message || "Cập nhật ghế thất bại.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật ghế.";
      toast.error(errorMessage);
    }
  };

  // Toggle seat selection
  const toggleSeatSelection = (layoutId: number) => {
    if (!isBulkSelecting) return;

    setSelectedSeats((prev) =>
      prev.includes(layoutId)
        ? prev.filter((id) => id !== layoutId)
        : [...prev, layoutId]
    );
  };

  // Handle column selection
  const handleColumnSelect = (columnIndex: number) => {
    if (!isBulkSelecting || !seatLayout) return;

    const columnSeatIds = seatLayout.rows.flatMap((row) =>
      row.Seats.filter((seat) => seat.Column_Number === columnIndex).map(
        (seat) => seat.Layout_ID
      )
    );

    const allSelected = columnSeatIds.every((id) => selectedSeats.includes(id));

    if (allSelected) {
      setSelectedSeats((prev) =>
        prev.filter((id) => !columnSeatIds.includes(id))
      );
    } else {
      setSelectedSeats((prev) => [...new Set([...prev, ...columnSeatIds])]);
    }
  };

  // Handle row selection
  const handleRowSelect = (row: Row) => {
    if (!isBulkSelecting) return;

    const rowSeatIds = row.Seats.map((seat) => seat.Layout_ID);
    const allSelected = rowSeatIds.every((id) => selectedSeats.includes(id));

    if (allSelected) {
      setSelectedSeats((prev) => prev.filter((id) => !rowSeatIds.includes(id)));
    } else {
      setSelectedSeats((prev) => [...new Set([...prev, ...rowSeatIds])]);
    }
  };

  // Handle seat click
  const handleSeatClick = (seat: Seat) => {
    if (isBulkSelecting) {
      toggleSeatSelection(seat.Layout_ID);
      return;
    }

    updateSeatStatus(seat.Layout_ID, seat.Is_Active);
  };

  // Create room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = getToken();
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại!");
      return;
    }

    if (!newRoom.RoomName?.trim()) {
      toast.error("Tên phòng là bắt buộc.");
      return;
    }
    if (!newRoom.Capacity || newRoom.Capacity <= 0) {
      toast.error("Số ghế phải lớn hơn 0.");
      return;
    }
    if (!newRoom.RoomType?.trim()) {
      toast.error("Loại phòng là bắt buộc.");
      return;
    }

    try {
      const response = await api.post("/cinema-rooms", newRoom, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        await fetchCinemaRooms();
        toast.success(
          `Phòng chiếu '${newRoom.RoomName}' đã được tạo thành công!`
        );
        handleCloseModal();
      } else {
        throw new Error("Dữ liệu trả về từ server không hợp lệ.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể tạo phòng chiếu.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  // Update room
  const handleUpdateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentRoomId) {
      toast.error("Không có phòng chiếu nào được chọn để cập nhật.");
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại!");
      return;
    }

    if (!newRoom.RoomName?.trim()) {
      toast.error("Tên phòng là bắt buộc.");
      return;
    }
    if (!newRoom.Capacity || newRoom.Capacity <= 0) {
      toast.error("Số ghế phải lớn hơn 0.");
      return;
    }
    if (!newRoom.RoomType?.trim()) {
      toast.error("Loại phòng là bắt buộc.");
      return;
    }

    try {
      const response = await api.put(`/cinema-rooms/${currentRoomId}`, newRoom, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        await fetchCinemaRooms();
        toast.success(
          `Phòng chiếu '${newRoom.RoomName}' đã được cập nhật thành công!`
        );
        handleCloseModal();
      } else {
        throw new Error("Dữ liệu trả về từ server không hợp lệ.");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể cập nhật phòng chiếu.";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  // Delete room
  const handleDeleteRoom = async (id: number) => {
    const token = getToken();
    if (!token) {
      toast.error("Xác thực thất bại. Vui lòng đăng nhập lại!");
      return;
    }

    try {
      await api.delete(`/cinema-rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      await fetchCinemaRooms();
      toast.success("Phòng chiếu đã được xóa thành công!");
      setConfirmDeleteId(null);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể xóa phòng chiếu.";
      toast.error(`Lỗi: ${errorMessage}`);
      setConfirmDeleteId(null);
    }
  };

  // Open add room modal
  const handleAddRoom = () => {
    setNewRoom({
      RoomName: "",
      Capacity: 0,
      RoomType: "",
      Description: "",
      Status: "Active",
    });
    setIsUpdatingRoom(false);
    setIsAddingRoom(true);
  };

  // Open edit room modal
  const handleEditRoom = (room: CinemaRoomResponse) => {
    setCurrentRoomId(room.Cinema_Room_ID);
    setNewRoom({
      RoomName: room.Room_Name,
      Capacity: room.Seat_Quantity,
      RoomType: room.Room_Type,
      Description: room.Notes || "",
      Status: room.Status,
    });
    setIsAddingRoom(false);
    setIsUpdatingRoom(true);
  };

  // Open create seat layout modal
  const handleOpenCreateSeatLayout = (roomId: number) => {
    const selectedRoom = cinemaRooms.find(
      (room) => room.Cinema_Room_ID === roomId
    );
    if (!selectedRoom) {
      toast.error("Không tìm thấy phòng chiếu!");
      return;
    }

    if (roomSeatLayoutStatus[roomId]) {
      toast.warn("Phòng đã có bố cục ghế, không thể tạo mới!");
      return;
    }

    setCurrentRoomId(roomId);
    setNewRoom({
      RoomName: selectedRoom.Room_Name,
      Capacity: selectedRoom.Seat_Quantity,
      RoomType: selectedRoom.Room_Type,
      Description: selectedRoom.Notes || "",
      Status: selectedRoom.Status,
    });
    setRowsInput("");
    setColumnsPerRow(0);
    setSeatType("Regular");
    setEmptyColumnsInput("");
    setEmptyColumns([]);
    setIsCreatingSeatLayout(true);
  };

  // Close modals
  const handleCloseModal = () => {
    setIsAddingRoom(false);
    setIsUpdatingRoom(false);
    setIsCreatingSeatLayout(false);
    setIsViewingSeatLayout(false);
    setConfirmDeleteId(null);
    setCurrentRoomId(null);
    setSeatLayout(null);
    setSelectedSeats([]);
    setIsBulkSelecting(false);
    setNewRoom({
      RoomName: "",
      Capacity: 0,
      RoomType: "",
      Description: "",
      Status: "Active",
    });
  };

  // Parse empty columns input
  useEffect(() => {
    try {
      const columnValues = emptyColumnsInput
        .split(",")
        .map((item) => item.trim())
        .filter((item) => item !== "")
        .map((item) => parseInt(item));
      const validColumns = columnValues.filter(
        (val) => !isNaN(val) && Number.isInteger(val) && val >= 0
      );
      setEmptyColumns(validColumns);
    } catch (error) {
      setEmptyColumns([]);
    }
  }, [emptyColumnsInput]);

  // Initial fetch
  useEffect(() => {
    fetchCinemaRooms();
  }, []);

  // Seat layout info display
  const SeatLayoutInfoDisplay = () => {
    let totalRows = 0;

    if (rowsInput.includes("-")) {
      const [start, end] = rowsInput.split("-").map((char) => char.trim());
      if (start.length === 1 && end.length === 1) {
        const startCode = start.charCodeAt(0);
        const endCode = end.charCodeAt(0);
        if (startCode <= endCode) {
          totalRows = endCode - startCode + 1;
        }
      }
    } else {
      totalRows = rowsInput.split(",").length;
    }

    const calculatedSeats = totalRows * columnsPerRow;
    const matchesCapacity = calculatedSeats === newRoom.Capacity;

    return (
      <div
        className={`seat-info-container ${
          matchesCapacity ? "info-blue" : "info-yellow"
        }`}
      >
        <p
          className={`seat-info-text ${
            matchesCapacity ? "text-blue" : "text-yellow"
          }`}
        >
          <FiInfo className="seat-info-icon" />
          {rowsInput ? (
            <>
              Tổng số ghế phải bằng số hàng × số cột. Cho phòng này: {totalRows}{" "}
              hàng × {columnsPerRow} cột = {calculatedSeats} ghế (Sức chứa
              phòng: {newRoom.Capacity})
              {!matchesCapacity && (
                <div className="seat-info-warning">
                  Số ghế không khớp với sức chứa phòng!
                </div>
              )}
            </>
          ) : (
            <>Vui lòng nhập thông tin hàng và số cột để xem tính toán</>
          )}
        </p>
      </div>
    );
  };

  // Filter rooms
  const filteredRooms = cinemaRooms.filter((room) => {
    const matchesSearch = room.Room_Name.toLowerCase().includes(
      searchTerm.toLowerCase()
    );
    const matchesStatus = statusFilter === "all" || room.Status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="manage-cinema-room">
      <ToastContainer position="top-right" autoClose={5000} />

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quản Lý Phòng Chiếu</h1>
          <p className="page-subtitle">
            Quản lý các phòng chiếu và bố cục ghế của chúng
          </p>
        </div>
        <button onClick={handleAddRoom} className="add-room-button">
          <FiPlus className="add-room-icon" />
          Thêm Phòng Chiếu Mới
        </button>
      </div>

      {/* Cinema Details */}
      {cinemaInfo && (
        <div className="selected-cinema-info">
          <div className="cinema-info-card">
            <h3 className="cinema-info-title">{cinemaInfo.Cinema_Name}</h3>
            <div className="cinema-info-details">
              <div className="cinema-info-address">
                <FiInfo className="cinema-info-icon" />
                {cinemaInfo.Address}, {cinemaInfo.City}, {cinemaInfo.Province}
              </div>
              <div className="cinema-info-phone">
                <FiInfo className="cinema-info-icon" />
                {cinemaInfo.Phone_Number}
              </div>
              <div className="cinema-info-email">
                <FiInfo className="cinema-info-icon" />
                {cinemaInfo.Email}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="filters-container">
        <div className="filters-left">
          <div className="search-wrapper">
            <div className="search-container">
              <input
                type="text"
                placeholder="Tìm kiếm phòng chiếu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <FiSearch className="search-icon" />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="clear-search-button"
                >
                  <FiX className="clear-search-icon" />
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="filters-center">
          <div className="view-mode-toggle">
            <button
              onClick={() => setViewMode("table")}
              className={`view-mode-button ${
                viewMode === "table" ? "view-mode-button-active" : ""
              }`}
              title="Chế Độ Bảng"
            >
              <FiLayout className="view-mode-icon" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`view-mode-button ${
                viewMode === "grid" ? "view-mode-button-active" : ""
              }`}
              title="Chế Độ Lưới"
            >
              <FiGrid className="view-mode-icon" />
            </button>
          </div>
        </div>

        <div className="filters-right">
          <div className="status-filter-wrapper">
            <div className="status-filter-container">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter-select"
              >
                <option value="all">Tất Cả Trạng Thái</option>
                <option value="Active">Hoạt Động</option>
                <option value="Inactive">Không Hoạt Động</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          <div className="error-content">
            <FiAlertCircle className="error-icon" />
            <p className="error-text">{error}</p>
          </div>
          <button onClick={fetchCinemaRooms} className="error-retry-button">
            <FiRefreshCw className="error-retry-icon" /> Thử Lại
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p className="loading-text">Đang tải danh sách phòng chiếu...</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          {viewMode === "table" && (
            <div className="table-view">
              {filteredRooms.length > 0 ? (
                <div className="table-scroll-container">
                  <table className="cinema-room-table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-header-cell">ID</th>
                        <th className="table-header-cell">Tên Phòng</th>
                        <th className="table-header-cell">Loại Phòng</th>
                        <th className="table-header-cell">Số Ghế</th>
                        <th className="table-header-cell">Trạng Thái</th>
                        <th className="table-header-cell">
                          Có Suất Chiếu Sắp Tới
                        </th>
                        <th className="table-header-cell text-right">
                          Hành Động
                        </th>
                      </tr>
                    </thead>
                    <tbody className="table-body">
                      {filteredRooms.map((room) => (
                        <tr key={room.Cinema_Room_ID} className="table-row">
                          <td className="table-cell">
                            <div className="cell-content-bold">
                              {room.Cinema_Room_ID}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="cell-content-bold">
                              {room.Room_Name}
                            </div>
                          </td>
                          <td className="table-cell">
                            <div className="cell-content">{room.Room_Type}</div>
                          </td>
                          <td className="table-cell">
                            <div className="cell-content">
                              {room.Seat_Quantity}
                            </div>
                          </td>
                          <td className="table-cell">
                            <span
                              className={`status-label ${
                                room.Status === "Active"
                                  ? "status-active"
                                  : "status-inactive-red"
                              }`}
                            >
                              {room.Status}
                            </span>
                          </td>
                          <td className="table-cell">
                            <div className="cell-content">
                              {room.HasUpcomingShowtimes ? "Có" : "Không"}
                            </div>
                          </td>
                          <td className="table-cell text-right">
                            <div className="action-buttons">
                              <button
                                onClick={() =>
                                  fetchSeatLayout(room.Cinema_Room_ID)
                                }
                                className="view-layout-button"
                                title="Xem Bố Cục Ghế"
                              >
                                <FiEye className="action-icon" />
                              </button>
                              <button
                                onClick={() =>
                                  handleOpenCreateSeatLayout(room.Cinema_Room_ID)
                                }
                                className={`create-layout-button ${
                                  roomSeatLayoutStatus[room.Cinema_Room_ID]
                                    ? "disabled-button"
                                    : ""
                                }`}
                                disabled={
                                  roomSeatLayoutStatus[room.Cinema_Room_ID]
                                }
                                title={
                                  roomSeatLayoutStatus[room.Cinema_Room_ID]
                                    ? "Phòng đã có bố cục ghế, không thể tạo mới!"
                                    : "Tạo/Chỉnh Sửa Bố Cục Ghế"
                                }
                              >
                                <FiLayout className="action-icon" />
                              </button>
                              <button
                                onClick={() => handleEditRoom(room)}
                                className="edit-button"
                                title="Chỉnh Sửa Phòng Chiếu"
                              >
                                <FiEdit2 className="action-icon" />
                              </button>
                              <button
                                onClick={() =>
                                  setConfirmDeleteId(room.Cinema_Room_ID)
                                }
                                className={`delete-button ${
                                  room.HasUpcomingShowtimes
                                    ? "delete-button-disabled"
                                    : ""
                                }`}
                                disabled={room.HasUpcomingShowtimes}
                                title={
                                  room.HasUpcomingShowtimes
                                    ? "Không thể xóa: Phòng có suất chiếu sắp tới"
                                    : "Xóa Phòng Chiếu"
                                }
                              >
                                <FiTrash2 className="action-icon" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data-message">
                  <FiInfo className="no-data-icon" />
                  <h3 className="no-data-title">Không tìm thấy phòng chiếu</h3>
                  <p className="no-data-text">
                    {searchTerm || statusFilter !== "all"
                      ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn"
                      : "Thêm một phòng chiếu mới để bắt đầu"}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="grid-view">
              {filteredRooms.length > 0 ? (
                filteredRooms.map((room) => (
                  <div key={room.Cinema_Room_ID} className="grid-card">
                    <div className="grid-card-content">
                      <div className="grid-card-header">
                        <h3 className="grid-card-title" title={room.Room_Name}>
                          {room.Room_Name}
                        </h3>
                        <span
                          className={`status-label ${
                            room.Status === "Active"
                              ? "status-active"
                              : "status-inactive-red"
                          }`}
                        >
                          {room.Status}
                        </span>
                      </div>

                      <div className="grid-card-details">
                        <div className="grid-card-detail">
                          <span className="detail-label">ID:</span>
                          <span className="detail-value">
                            {room.Cinema_Room_ID}
                          </span>
                        </div>
                        <div className="grid-card-detail">
                          <span className="detail-label">Loại Phòng:</span>
                          <span className="detail-value">{room.Room_Type}</span>
                        </div>
                        <div className="grid-card-detail">
                          <span className="detail-label">Số Ghế:</span>
                          <span className="detail-value">
                            {room.Seat_Quantity}
                          </span>
                        </div>
                        <div className="grid-card-detail">
                          <span className="detail-label">Suất Chiếu Sắp Tới:</span>
                          <span className="detail-value">
                            {room.HasUpcomingShowtimes ? "Có" : "Không"}
                          </span>
                        </div>
                      </div>

                      <div className="grid-card-actions">
                        <button
                          onClick={() => fetchSeatLayout(room.Cinema_Room_ID)}
                          className="view-layout-button"
                          title="Xem Bố Cục Ghế"
                        >
                          <FiEye className="action-icon" />
                        </button>
                        <button
                          onClick={() =>
                            handleOpenCreateSeatLayout(room.Cinema_Room_ID)
                          }
                          className={`create-layout-button ${
                            roomSeatLayoutStatus[room.Cinema_Room_ID]
                              ? "disabled-button"
                              : ""
                          }`}
                          disabled={roomSeatLayoutStatus[room.Cinema_Room_ID]}
                          title={
                            roomSeatLayoutStatus[room.Cinema_Room_ID]
                              ? "Phòng đã có bố cục ghế, không thể tạo mới!"
                              : "Tạo/Chỉnh Sửa Bố Cục Ghế"
                          }
                        >
                          <FiLayout className="action-icon" />
                        </button>
                        <button
                          onClick={() => handleEditRoom(room)}
                          className="edit-button"
                          title="Chỉnh Sửa Phòng Chiếu"
                        >
                          <FiEdit2 className="action-icon" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(room.Cinema_Room_ID)}
                          className={`delete-button ${
                            room.HasUpcomingShowtimes
                              ? "delete-button-disabled"
                              : ""
                          }`}
                          disabled={room.HasUpcomingShowtimes}
                          title={
                            room.HasUpcomingShowtimes
                              ? "Không thể xóa: Phòng có suất chiếu sắp tới"
                              : "Xóa Phòng Chiếu"
                          }
                        >
                          <FiTrash2 className="action-icon" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data-message grid-no-data">
                  <FiInfo className="no-data-icon" />
                  <h3 className="no-data-title">Không tìm thấy phòng chiếu</h3>
                  <p className="no-data-text">
                    {searchTerm || statusFilter !== "all"
                      ? "Thử điều chỉnh tiêu chí tìm kiếm hoặc bộ lọc của bạn"
                      : "Thêm một phòng chiếu mới để bắt đầu"}
                  </p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Room Modal */}
      <Modal
        isOpen={isAddingRoom || isUpdatingRoom}
        onClose={handleCloseModal}
        size="md"
      >
        <div className="modal-body">
          <h2 className="modal-title">
            {isUpdatingRoom ? "Cập Nhật Phòng Chiếu" : "Thêm Phòng Chiếu Mới"}
          </h2>
          <form
            onSubmit={isUpdatingRoom ? handleUpdateRoom : handleCreateRoom}
            className="modal-form"
          >
            <div className="form-group">
              <label className="form-label">
                Tên Phòng <span className="required">*</span>
              </label>
              <input
                type="text"
                value={newRoom.RoomName || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, RoomName: e.target.value })
                }
                className="form-input"
                placeholder="Nhập tên phòng"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Số Ghế <span className="required">*</span>
              </label>
              <input
                type="number"
                value={newRoom.Capacity || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, Capacity: parseInt(e.target.value) })
                }
                className="form-input"
                placeholder="Nhập số ghế"
                required
                min="1"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Loại Phòng <span className="required">*</span>
              </label>
              <select
                value={newRoom.RoomType || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, RoomType: e.target.value })
                }
                className="form-select"
                required
              >
                <option value="">Chọn loại phòng</option>
                <option value="2D">2D</option>
                <option value="3D">3D</option>
                <option value="IMAX">IMAX</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Ghi Chú</label>
              <textarea
                value={newRoom.Description || ""}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, Description: e.target.value })
                }
                className="form-textarea"
                rows={4}
                placeholder="Ghi chú (Tùy Chọn)"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Trạng Thái <span className="required">*</span>
              </label>
              <select
                value={newRoom.Status || "Active"}
                onChange={(e) =>
                  setNewRoom({ ...newRoom, Status: e.target.value })
                }
                className="form-select"
                required
              >
                <option value="Active">Hoạt Động</option>
                <option value="Inactive">Không Hoạt Động</option>
              </select>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                onClick={handleCloseModal}
                className="modal-cancel-button"
              >
                Hủy
              </button>
              <button type="submit" className="modal-submit-button">
                {isUpdatingRoom ? "Cập Nhật Phòng" : "Thêm Phòng"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Create Seat Layout Modal */}
      <Modal
        isOpen={isCreatingSeatLayout}
        onClose={() => setIsCreatingSeatLayout(false)}
        size="md"
      >
        <div className="modal-body">
          <h2 className="modal-title">Tạo Bố Cục Ghế</h2>
          <form onSubmit={handleCreateSeatLayout} className="modal-form">
            <div className="form-group">
              <label className="form-label">
                Nhãn Hàng (VD: A-Z) <span className="required">*</span>
              </label>
              <input
                type="text"
                value={rowsInput}
                onChange={(e) => setRowsInput(e.target.value)}
                className="form-input"
                placeholder="Nhập dãy ký tự (VD: A-Z)"
                required
              />
              <p className="form-help-text">
                Nhập dãy hàng ở định dạng "A-Z".
              </p>
            </div>

            <div className="form-group">
              <label className="form-label">
                Số Cột Mỗi Hàng <span className="required">*</span>
              </label>
              <input
                type="number"
                value={columnsPerRow || ""}
                onChange={(e) =>
                  setColumnsPerRow(parseInt(e.target.value) || 0)
                }
                className="form-input"
                placeholder="Nhập số cột"
                min="1"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Loại Ghế Mặc Định</label>
              <select
                value={seatType}
                onChange={(e) => setSeatType(e.target.value)}
                className="form-select"
              >
                <option value="Regular">Thường</option>
                <option value="VIP">VIP</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Cột Trống (Tùy Chọn)</label>
              <input
                type="text"
                value={emptyColumnsInput}
                onChange={(e) => setEmptyColumnsInput(e.target.value)}
                className="form-input"
                placeholder="VD: 0,2,5"
              />
              <p className="form-help-text">
                Nhập các số cột để bỏ trống, ngăn cách bằng dấu phẩy "VD: 0,2,5"
              </p>
            </div>

            <SeatLayoutInfoDisplay />

            <div className="modal-actions">
              <button
                type="button"
                onClick={() => setIsCreatingSeatLayout(false)}
                className="modal-cancel-button"
              >
                <FiX className="action-icon inline-block mr-2" />
                Hủy
              </button>
              <button type="submit" className="modal-submit-button">
                <FiCheck className="action-icon inline-block mr-2" />
                Tạo Bố Cục
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={confirmDeleteId !== null}
        onClose={() => setConfirmDeleteId(null)}
        size="sm"
      >
        <div className="modal-body">
          <div className="delete-confirmation">
            <FiAlertTriangle className="delete-icon" />
          </div>
          <h2 className="modal-title text-center">Xác Nhận Xóa</h2>
          <p className="modal-message text-center">
            Bạn có chắc chắn muốn xóa phòng chiếu này không? Hành động này không
            thể hoàn tác.
          </p>
          <div className="modal-actions justify-center">
            <button
              onClick={() => setConfirmDeleteId(null)}
              className="modal-cancel-button"
            >
              Hủy
            </button>
            <button
              onClick={() =>
                confirmDeleteId && handleDeleteRoom(confirmDeleteId)
              }
              className="modal-delete-button"
            >
              Xóa
            </button>
          </div>
        </div>
      </Modal>

      {/* Seat Layout Viewing Modal */}
      <Modal isOpen={isViewingSeatLayout} onClose={handleCloseModal} size="xl">
        <div className="modal-body seat-layout-modal">
          <div className="seat-layout-header">
            <h2 className="modal-title">
              {seatLayout?.cinema_room.Room_Name} - Bố Cục Ghế
            </h2>
            <div className="seat-layout-actions">
              <button
                onClick={() => setIsBulkSelecting(!isBulkSelecting)}
                className={`bulk-select-button ${
                  isBulkSelecting ? "bulk-select-active" : ""
                }`}
              >
                {isBulkSelecting ? (
                  <>
                    <FiCheckSquare className="action-icon inline-block mr-2" />
                    Thoát Chọn Hàng Loạt
                  </>
                ) : (
                  <>
                    <FiSquare className="action-icon inline-block mr-2" />
                    Chọn Hàng Loạt
                  </>
                )}
              </button>
              <button
                onClick={handleDeleteSeatLayout}
                className="delete-layout-button"
              >
                <FiTrash2 className="action-icon inline-block mr-2" />
                Xóa Bố Cục
              </button>
              <button onClick={handleCloseModal} className="modal-close-action">
                <FiX className="action-icon" />
              </button>
            </div>
          </div>

          {/* Thêm thông tin chi tiết phòng */}
          {cinemaInfo && seatLayout && (
            <div className="room-detail-info">
              <div className="room-detail-card">
                <h3 className="room-detail-title">Thông Tin Phòng Chiếu</h3>
                <div className="room-detail-content">
                  <div className="room-detail-item">
                    <span className="room-detail-label">Tên Phòng:</span>
                    <span className="room-detail-value">{seatLayout?.cinema_room.Room_Name}</span>
                  </div>
                  <div className="room-detail-item">
                    <span className="room-detail-label">Loại Phòng:</span>
                    <span className="room-detail-value">{seatLayout?.cinema_room.Room_Type}</span>
                  </div>
                  <div className="room-detail-item">
                    <span className="room-detail-label">Rạp Chiếu:</span>
                    <span className="room-detail-value">{cinemaInfo.Cinema_Name}</span>
                  </div>
                  <div className="room-detail-item">
                    <span className="room-detail-label">Địa Chỉ:</span>
                    <span className="room-detail-value">{cinemaInfo.Address}, {cinemaInfo.City}</span>
                  </div>
                  {(() => {
                    const currentRoom = cinemaRooms.find(room => room.Cinema_Room_ID === seatLayout?.cinema_room.Cinema_Room_ID);
                    return currentRoom?.Notes ? (
                      <div className="room-detail-item">
                        <span className="room-detail-label">Ghi Chú:</span>
                        <span className="room-detail-value">{currentRoom.Notes}</span>
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            </div>
          )}

          {isLoadingSeatLayout ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Đang tải bố cục ghế...</p>
            </div>
          ) : seatLayout ? (
            <>
              {isBulkSelecting && (
                <div className="bulk-actions">
                  <div className="bulk-action-item">
                    <span className="bulk-action-label">
                      {selectedSeats.length} ghế đã chọn
                    </span>
                  </div>
                  <div className="bulk-action-item">
                    <span className="bulk-action-label">Loại ghế:</span>
                    <select
                      value={bulkSeatType}
                      onChange={(e) => setBulkSeatType(e.target.value)}
                      className="bulk-action-select"
                    >
                      <option value="Regular">Thường</option>
                      <option value="VIP">VIP</option>
                    </select>
                  </div>
                  <div className="bulk-action-item">
                    <span className="bulk-action-label">Trạng thái:</span>
                    <select
                      value={bulkIsActive.toString()}
                      onChange={(e) =>
                        setBulkIsActive(e.target.value === "true")
                      }
                      className="bulk-action-select"
                    >
                      <option value="true">Hoạt Động</option>
                      <option value="false">Không Hoạt Động</option>
                    </select>
                  </div>
                  <button
                    onClick={bulkUpdateSeats}
                    disabled={selectedSeats.length === 0}
                    className="bulk-action-button"
                  >
                    Cập Nhật Ghế
                  </button>
                </div>
              )}

              <div className="seat-layout-content">
                <div className="screen">
                  <div className="screen-text">MÀN HÌNH</div>
                </div>

                <div className="scrollable-seating-area">
                  <div className="seating-area">
                    <div></div>
                    <div
                      className="column-header"
                      style={{
                        gridTemplateColumns: `repeat(${seatLayout.dimensions.columns}, 40px)`,
                      }}
                    >
                      {Array.from(
                        { length: seatLayout.dimensions.columns },
                        (_, i) => i + 1
                      ).map((col) => (
                        <div
                          key={`header-${col}`}
                          onClick={() => handleColumnSelect(col)}
                          className={`column-label ${
                            isBulkSelecting &&
                            seatLayout.rows
                              .flatMap((row) =>
                                row.Seats.filter(
                                  (seat) => seat.Column_Number === col
                                )
                              )
                              .every((seat) =>
                                selectedSeats.includes(seat.Layout_ID)
                              )
                              ? "column-label-selected"
                              : seatLayout.rows
                                  .flatMap((row) =>
                                    row.Seats.filter(
                                      (seat) => seat.Column_Number === col
                                    )
                                  )
                                  .some((seat) =>
                                    selectedSeats.includes(seat.Layout_ID)
                                  )
                              ? "column-label-partial"
                              : ""
                          }`}
                        >
                          {col}
                        </div>
                      ))}
                    </div>
                    <div></div>

                    {seatLayout.rows.map((row, rowIndex) => (
                      <motion.div
                        key={`row-${row.Row}`}
                        className="row-container"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: rowIndex * 0.05 }}
                      >
                        <div
                          onClick={() => handleRowSelect(row)}
                          className={`row-label ${
                            isBulkSelecting &&
                            row.Seats.every((seat) =>
                              selectedSeats.includes(seat.Layout_ID)
                            )
                              ? "row-label-selected"
                              : row.Seats.some((seat) =>
                                  selectedSeats.includes(seat.Layout_ID)
                                )
                              ? "row-label-partial"
                              : ""
                          }`}
                        >
                          {row.Row}
                        </div>

                        <div
                          className="seats-section"
                          style={{
                            gridTemplateColumns: `repeat(${seatLayout.dimensions.columns}, 40px)`,
                          }}
                        >
                          {Array.from(
                            { length: seatLayout.dimensions.columns },
                            (_, i) => i + 1
                          ).map((col) => {
                            const seat = row.Seats.find(
                              (s) => s.Column_Number === col
                            );

                            if (!seat) {
                              return (
                                <div
                                  key={`empty-${row.Row}-${col}`}
                                  className="seat-empty"
                                ></div>
                              );
                            }

                            const isSelected = selectedSeats.includes(
                              seat.Layout_ID
                            );

                            return (
                              <div
                                key={`seat-${seat.Layout_ID}`}
                                className="seat-button-wrapper"
                              >
                                <motion.button
                                  className={`seat-button ${
                                    seat.Is_Active
                                      ? `seat-type-${seat.Seat_Type.toLowerCase()}`
                                      : "is-active-false"
                                  } ${isSelected ? "is-selected" : ""}`}
                                  onClick={() => handleSeatClick(seat)}
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <span className="seat-number">{col}</span>
                                </motion.button>
                                <div className="seat-tooltip">
                                  {seat.Row_Label}
                                  {seat.Column_Number} - {seat.Seat_Type}
                                  <br />
                                  {seat.Is_Active
                                    ? "Hoạt Động"
                                    : "Không Hoạt Động"}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        <div
                          onClick={() => handleRowSelect(row)}
                          className={`row-label ${
                            isBulkSelecting &&
                            row.Seats.every((seat) =>
                              selectedSeats.includes(seat.Layout_ID)
                            )
                              ? "row-label-selected"
                              : row.Seats.some((seat) =>
                                  selectedSeats.includes(seat.Layout_ID)
                                )
                              ? "row-label-partial"
                              : ""
                          }`}
                        >
                          {row.Row}
                        </div>
                      </motion.div>
                    ))}

                    <div></div>
                    <div
                      className="column-footer"
                      style={{
                        gridTemplateColumns: `repeat(${seatLayout.dimensions.columns}, 40px)`,
                      }}
                    >
                      {Array.from(
                        { length: seatLayout.dimensions.columns },
                        (_, i) => i + 1
                      ).map((col) => (
                        <div
                          key={`footer-${col}`}
                          onClick={() => handleColumnSelect(col)}
                          className={`column-label ${
                            isBulkSelecting &&
                            seatLayout.rows
                              .flatMap((row) =>
                                row.Seats.filter(
                                  (seat) => seat.Column_Number === col
                                )
                              )
                              .every((seat) =>
                                selectedSeats.includes(seat.Layout_ID)
                              )
                              ? "column-label-selected"
                              : seatLayout.rows
                                  .flatMap((row) =>
                                    row.Seats.filter(
                                      (seat) => seat.Column_Number === col
                                    )
                                  )
                                  .some((seat) =>
                                    selectedSeats.includes(seat.Layout_ID)
                                  )
                              ? "column-label-partial"
                              : ""
                          }`}
                        >
                          {col}
                        </div>
                      ))}
                    </div>
                    <div></div>
                  </div>
                </div>

                <div className="seat-legend">
                  <div className="legend-item">
                    <div className="color-box regular"></div>
                    <span>Thường</span>
                  </div>
                  <div className="legend-item">
                    <div className="color-box vip"></div>
                    <span>VIP</span>
                  </div>
                  <div className="legend-item">
                    <div className="color-box inactive"></div>
                    <span>Không Hoạt Động</span>
                  </div>
                  {isBulkSelecting && (
                    <div className="legend-item">
                      <div className="selected-seat-indicator"></div>
                      <span>Đã Chọn</span>
                    </div>
                  )}
                </div>

                <div className="room-stats">
                  <h3 className="room-stats-title">Thống Kê Phòng</h3>
                  <div className="room-stats-grid">
                    <div className="room-stats-item">
                      <p className="room-stats-label">Tổng Số Ghế</p>
                      <p className="room-stats-value">
                        {seatLayout.stats.total_seats}
                      </p>
                    </div>
                    <div className="room-stats-item">
                      <p className="room-stats-label">Kích Thước</p>
                      <p className="room-stats-value">
                        {seatLayout.dimensions.rows} ×{" "}
                        {seatLayout.dimensions.columns}
                      </p>
                    </div>
                    {seatLayout.stats.seat_types.map((type) => (
                      <div key={type.SeatType} className="room-stats-item">
                        <p className="room-stats-label">Ghế {type.SeatType}</p>
                        <p className="room-stats-value">{type.Count}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="no-data-message">
              <FiAlertCircle className="no-data-icon warning-icon" />
              <h3 className="no-data-title">Chưa có bố cục ghế</h3>
              <p className="no-data-text">
                Phòng chiếu này chưa có bố cục ghế. Tạo một bố cục để bắt đầu.
              </p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ManageCinemaRoom;