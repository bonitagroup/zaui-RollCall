import React, { useState, useEffect } from 'react';
import { Box, Text, Icon } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { userState, historyRecordsSelector } from '@/states/state';
import {
  formatDateDisplay,
  formatTimeDisplay,
  calculateShiftStatus,
  checkSessionLeave,
} from '@/lib/utils';
import api from '@/lib/api';

const History = (): JSX.Element => {
  const user = useRecoilValue(userState);
  const records = useRecoilValue(historyRecordsSelector);
  const [leaves, setLeaves] = useState<any[]>([]);

  // 1. Fetch danh sách nghỉ phép
  useEffect(() => {
    const fetchLeaves = async () => {
      // SỬA LỖI: Kiểm tra user tồn tại trước
      if (!user || !user.zalo_id) return;

      try {
        const res: any = await api.get('/leave-requests/mine', {
          params: { zalo_id: user.zalo_id },
        });
        if (res.success) {
          setLeaves(res.data.filter((l: any) => l.status === 'approved'));
        }
      } catch (error) {
        console.error('Error fetching leaves:', error);
      }
    };
    fetchLeaves();
  }, [user?.zalo_id]); // SỬA LỖI: Thêm dấu ? vào user?.zalo_id

  if (records.length === 0) {
    return (
      <Box className="text-center py-8 text-gray-400 text-sm italic">Chưa có dữ liệu chấm công</Box>
    );
  }

  // 2. Hàm render trạng thái thông minh
  const renderShiftStatus = (
    checkIn: string | null,
    checkOut: string | null,
    shiftIndex: 0 | 1,
    dateStr: string
  ) => {
    // Ưu tiên 1: Đủ công
    if (checkIn && checkOut) {
      const status = calculateShiftStatus(checkIn, checkOut, shiftIndex);
      return <Text className={`text-xs font-bold ${status.color}`}>{status.text}</Text>;
    }

    // Ưu tiên 2: Nghỉ phép (Đè lên Vắng và Tương lai)
    const sessionName = shiftIndex === 0 ? 'morning' : 'afternoon';
    const isLeave = checkSessionLeave(dateStr, sessionName, leaves);

    if (isLeave) {
      return <Text className="text-xs font-bold text-purple-600">Nghỉ phép</Text>;
    }

    // Ưu tiên 3: Tương lai
    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr > todayStr) {
      return <Text className="text-xs font-bold text-gray-400">--</Text>;
    }

    // Ưu tiên 4: Vắng
    return <Text className="text-xs font-bold text-red-500">Vắng</Text>;
  };

  return (
    <Box className="flex flex-col gap-4 px-2 pb-20">
      {records.map((rec, idx) => {
        return (
          <Box
            key={`${rec.date}-${idx}`}
            className="flex flex-col w-full shadow-md bg-white rounded-xl p-4 border border-gray-100"
          >
            <Text className="font-bold text-lg mb-3 pb-2 border-b border-gray-200 text-gray-800">
              {formatDateDisplay(rec.date)}
            </Text>

            {/* CA SÁNG */}
            <Box className="flex flex-row justify-between mb-3 pb-3 border-b border-gray-50 items-center">
              <Box>
                <Box className="flex items-center mb-1">
                  <Icon icon="zi-radio-checked" className="text-yellow-500 mr-1 text-lg" />
                  <Text className="text-sm font-semibold text-gray-600">Ca sáng</Text>
                </Box>
                <Text className="text-xs text-gray-400 font-mono ml-6">
                  {formatTimeDisplay(rec.shifts.morning.checkIn || undefined)} -{' '}
                  {formatTimeDisplay(rec.shifts.morning.checkOut || undefined)}
                </Text>
              </Box>
              {renderShiftStatus(
                rec.shifts.morning.checkIn,
                rec.shifts.morning.checkOut,
                0,
                rec.date
              )}
            </Box>

            {/* CA CHIỀU */}
            <Box className="flex flex-row justify-between items-center">
              <Box>
                <Box className="flex items-center mb-1">
                  <Icon icon="zi-radio-checked" className="text-blue-500 mr-1 text-lg" />
                  <Text className="text-sm font-semibold text-gray-600">Ca chiều</Text>
                </Box>
                <Text className="text-xs text-gray-400 font-mono ml-6">
                  {formatTimeDisplay(rec.shifts.afternoon.checkIn || undefined)} -{' '}
                  {formatTimeDisplay(rec.shifts.afternoon.checkOut || undefined)}
                </Text>
              </Box>
              {renderShiftStatus(
                rec.shifts.afternoon.checkIn,
                rec.shifts.afternoon.checkOut,
                1,
                rec.date
              )}
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default History;
