import React from 'react';
import { Box, Text, Avatar, Button, Icon } from 'zmp-ui';

interface LeaveRequestItemProps {
  req: any;
  isHistory?: boolean;
  processingId: number | null;
  onAction: (id: number, status: 'approved' | 'rejected') => void;
  onDelete: (id: number) => void; // Thêm hàm xóa
}

const LeaveRequestItem: React.FC<LeaveRequestItemProps> = ({
  req,
  isHistory = false,
  processingId,
  onAction,
  onDelete,
}) => {
  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  // Helper hiển thị tên buổi
  const getSessionDisplay = (session: string) => (session === 'morning' ? 'Sáng' : 'Chiều');

  // Logic kiểm tra trọn 1 ngày
  const isFullDaySameDate =
    new Date(req.start_date).getTime() === new Date(req.end_date).getTime() &&
    req.start_session === 'morning' &&
    req.end_session === 'afternoon';

  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3 relative group">
      <Box className="flex justify-between items-start mb-3">
        <Box className="flex items-center gap-3">
          <Avatar src={req.avatar_url}>{req.name?.charAt(0)}</Avatar>
          <Box>
            <Text className="font-bold text-gray-800">{req.name}</Text>
            <Text size="xSmall" className="text-gray-400">
              Gửi: {formatDate(req.created_at)}
            </Text>
          </Box>
        </Box>

        <Box className="flex flex-col items-end gap-2">
          <Box
            className={`px-2 py-1 rounded text-[10px] font-bold uppercase border
                ${
                  req.status === 'pending'
                    ? 'bg-orange-50 text-orange-600 border-orange-200'
                    : req.status === 'approved'
                    ? 'bg-green-50 text-green-600 border-green-200'
                    : 'bg-red-50 text-red-600 border-red-200'
                }`}
          >
            {req.status === 'pending'
              ? 'Chờ duyệt'
              : req.status === 'approved'
              ? 'Đã duyệt'
              : 'Đã từ chối'}
          </Box>

          {/* Nút Xóa cho Admin (Chỉ hiện ở lịch sử hoặc đơn chờ) */}
          <Box onClick={() => onDelete(req.id)} className="p-1 active:opacity-50 cursor-pointer">
            <Icon icon="zi-delete" className="text-gray-400" size={20} />
          </Box>
        </Box>
      </Box>

      {/* Phần hiển thị Thời gian chi tiết */}
      <Box className="bg-gray-50 p-3 rounded-lg mb-3 border border-gray-100">
        <Box className="flex items-start gap-2 mb-1">
          <Icon icon="zi-calendar" className="text-blue-500 mt-0.5" size={16} />
          <Box>
            {isFullDaySameDate ? (
              // Trường hợp 1: Cả ngày
              <Text className="font-bold text-gray-800 text-sm">
                {formatDate(req.start_date)}{' '}
                <span className="text-purple-600 font-bold">(Cả ngày)</span>
              </Text>
            ) : (
              // Trường hợp 2: Lẻ buổi hoặc nhiều ngày
              <>
                <Text className="font-bold text-gray-800 text-sm">
                  {formatDate(req.start_date)}{' '}
                  <span className="text-blue-600 font-normal">
                    ({getSessionDisplay(req.start_session)})
                  </span>
                </Text>

                {req.start_date !== req.end_date && (
                  <Text className="text-xs text-gray-400">đến</Text>
                )}

                {req.start_date !== req.end_date && (
                  <Text className="font-bold text-gray-800 text-sm">
                    {formatDate(req.end_date)}{' '}
                    <span className="text-blue-600 font-normal">
                      ({getSessionDisplay(req.end_session)})
                    </span>
                  </Text>
                )}

                {/* Nếu cùng ngày mà lẻ (Sáng->Sáng) */}
                {req.start_date === req.end_date && (
                  <Text className="text-xs text-gray-500 italic">
                    (Chỉ buổi {getSessionDisplay(req.start_session)})
                  </Text>
                )}
              </>
            )}
          </Box>
        </Box>
        <Text className="text-sm text-gray-600 mt-2 pl-6">Lý do: {req.reason}</Text>
      </Box>

      {/* Nút Duyệt / Từ chối (Chỉ hiện khi Pending) */}
      {!isHistory && req.status === 'pending' && (
        <Box className="flex gap-3 mt-2">
          <Button
            fullWidth
            variant="secondary"
            size="medium"
            className="bg-red-50 text-red-600 border-red-200"
            loading={processingId === req.id}
            onClick={() => onAction(req.id, 'rejected')}
          >
            Từ chối
          </Button>
          <Button
            fullWidth
            size="medium"
            className="bg-green-600 text-white"
            loading={processingId === req.id}
            onClick={() => onAction(req.id, 'approved')}
          >
            Duyệt
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LeaveRequestItem;
