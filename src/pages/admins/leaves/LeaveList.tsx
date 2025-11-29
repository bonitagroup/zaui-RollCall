import React, { useEffect, useState } from 'react';
import { Box, Text, Icon, useSnackbar, Spinner, Modal } from 'zmp-ui'; // Import thêm Modal
import api from '@/lib/api';
import LeaveRequestItem from './LeaveRequestItem';

interface LeaveListProps {
  viewMode: 'pending' | 'history';
  onBack: () => void;
}

const LeaveList: React.FC<LeaveListProps> = ({ viewMode, onBack }) => {
  const { openSnackbar } = useSnackbar();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // State cho Modal xóa
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/leave-requests/list');
      if (res.success) {
        setRequests(res.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: number, status: 'approved' | 'rejected') => {
    try {
      setProcessingId(id);
      const res: any = await api.put('/leave-requests/status', { id, status });
      if (res.success) {
        openSnackbar({ text: 'Thành công!', type: 'success' });
        setRequests((prev) =>
          prev.map((req) => (req.id === id ? { ...req, status: status } : req))
        );
      } else {
        openSnackbar({ text: 'Lỗi', type: 'error' });
      }
    } catch {
      openSnackbar({ text: 'Lỗi kết nối', type: 'error' });
    } finally {
      setProcessingId(null);
    }
  };

  // --- Logic Xóa ---
  const confirmDelete = (id: number) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res: any = await api.delete(`/leave-requests/${itemToDelete}`);
      if (res.success) {
        openSnackbar({ text: 'Đã xóa đơn', type: 'success' });
        // Xóa khỏi list hiện tại
        setRequests((prev) => prev.filter((r) => r.id !== itemToDelete));
        setDeleteModalVisible(false);
      } else {
        openSnackbar({ text: 'Lỗi khi xóa', type: 'error' });
      }
    } catch (error) {
      openSnackbar({ text: 'Lỗi kết nối', type: 'error' });
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (viewMode === 'pending') return r.status === 'pending';
    return r.status !== 'pending';
  });

  const title = viewMode === 'pending' ? 'Đơn cần duyệt' : 'Lịch sử duyệt đơn';

  return (
    <Box className="flex flex-col h-full bg-gray-50">
      <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 px-4 py-4 pt-12 flex items-center space-x-3 shadow-sm sticky top-0 z-50">
        <Box onClick={onBack} className="active:opacity-50 mr-3 cursor-pointer">
          <Icon icon="zi-arrow-left" className="text-white text-2xl items-center" />
        </Box>
        <Text className="text-white font-bold text-xl flex-1">{title}</Text>
      </Box>

      {loading ? (
        <Box className="flex justify-center mt-10">
          <Spinner />
        </Box>
      ) : (
        <Box className="p-4 h-full overflow-y-auto pb-24">
          {filteredRequests.length === 0 ? (
            <Box className="flex flex-col items-center mt-20 opacity-50">
              <Icon icon="zi-inbox" size={48} className="text-gray-400 mb-2" />
              <Text className="text-gray-500">Không có dữ liệu</Text>
            </Box>
          ) : (
            filteredRequests.map((req) => (
              <LeaveRequestItem
                key={req.id}
                req={req}
                isHistory={viewMode === 'history'}
                processingId={processingId}
                onAction={handleAction}
                onDelete={confirmDelete} // Truyền hàm xóa
              />
            ))
          )}
        </Box>
      )}

      {/* Modal xác nhận xóa */}
      <Modal
        visible={deleteModalVisible}
        title="Xác nhận xóa"
        onClose={() => setDeleteModalVisible(false)}
        description="Bạn có chắc muốn xóa vĩnh viễn đơn nghỉ phép này không?"
        actions={[
          { text: 'Hủy', onClick: () => setDeleteModalVisible(false) },
          { text: 'Xóa', danger: true, highLight: true, onClick: handleDelete },
        ]}
      />
    </Box>
  );
};

export default LeaveList;
