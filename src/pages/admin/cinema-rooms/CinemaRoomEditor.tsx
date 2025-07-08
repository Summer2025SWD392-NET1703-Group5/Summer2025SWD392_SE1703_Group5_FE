import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { cinemaRoomService } from '../../../services/cinemaRoomService';
import CinemaRoomForm from '../../../components/admin/forms/CinemaRoomForm';
import type { CinemaRoom, CinemaRoomFormData } from '../../../types/cinemaRoom';
import FullScreenLoader from '../../../components/FullScreenLoader';

const CinemaRoomEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra URL có chứa '/new' không
  const isNewFromPath = location.pathname.includes('/new');
  const isNew = id === 'new' || isNewFromPath;

  const [room, setRoom] = useState<CinemaRoom | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(!isNew);
  const [saving, setSaving] = useState<boolean>(false);

  const cinemaId = searchParams.get('cinemaId');

  useEffect(() => {
    if (!isNew && id) {
      const fetchRoomData = async () => {
        try {
          setLoading(true);
          // Validate ID is a valid number before making the API call
          const roomId = parseInt(id);
          if (isNaN(roomId)) {
            toast.error('ID phòng chiếu không hợp lệ');
            navigate(`/admin/cinema-rooms?cinemaId=${cinemaId || ''}`);
            return;
          }

          const roomData = await cinemaRoomService.getCinemaRoomById(roomId);
          setRoom(roomData);
        } catch (error) {
          toast.error('Không thể tải dữ liệu phòng chiếu.');
          navigate(`/admin/cinema-rooms?cinemaId=${cinemaId || ''}`);
        } finally {
          setLoading(false);
        }
      };
      fetchRoomData();
    } else if (isNew && !cinemaId) {
      toast.error('Cần có ID của rạp để tạo phòng mới.');
      navigate('/admin/cinemas');
    } else if (isNew) {
      // Đảm bảo loading là false khi tạo phòng mới
      setLoading(false);
    }
  }, [id, isNew, cinemaId, navigate]);

  const handleFormSubmit = async (formData: CinemaRoomFormData) => {
    setSaving(true);
    const toastId = toast.loading(isNew ? 'Đang tạo phòng...' : 'Đang cập nhật...');

    try {
      if (isNew) {
        if (!cinemaId) throw new Error("Cinema ID is missing");
        await cinemaRoomService.createCinemaRoom(Number(cinemaId), formData);
        toast.success('Tạo phòng thành công!', { id: toastId });
      } else {
        await cinemaRoomService.updateCinemaRoom(Number(id), formData);
        toast.success('Cập nhật thành công!', { id: toastId });
      }
      navigate(`/admin/cinema-rooms?cinemaId=${cinemaId || room?.Cinema_ID}`);
    } catch (error: any) {
      const errorMessage = error.message || (isNew ? 'Tạo phòng thất bại' : 'Cập nhật thất bại');
      toast.error(errorMessage, { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/cinema-rooms?cinemaId=${cinemaId || room?.Cinema_ID || ''}`);
  };

  if (loading) {
    return <FullScreenLoader text="Đang tải thông tin phòng chiếu..." />;
  }

  return (
    <CinemaRoomForm
      room={room}
      onSubmit={handleFormSubmit}
      onCancel={handleCancel}
      loading={saving}
    />
  );
};

export default CinemaRoomEditor; 