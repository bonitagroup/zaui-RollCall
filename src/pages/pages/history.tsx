import { useState, useEffect, useMemo } from 'react'; // 1. Thêm useMemo
import { Box, Text, Icon } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { userState, historyRecordsSelector } from '@/states/state';
import {
  formatDateDisplay,
  formatTimeDisplay,
  fillMissingDays, // 2. Import hàm lấp đầy ngày
} from '@/lib/utils';
import api from '@/lib/api';
import { ShiftStatusBadge } from '@/components/common/ShiftStatusBadge';

const History = (): JSX.Element => {
  const user = useRecoilValue(userState);
  const records = useRecoilValue(historyRecordsSelector);
  const [leaves, setLeaves] = useState<any[]>([]);

  useEffect(() => {
    const fetchLeaves = async () => {
      if (!user?.zalo_id) return;
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
  }, [user?.zalo_id]);

  // 3. LOGIC MỚI: Tự động lấp đầy ngày vắng (Giống bên Admin)
  const displayRecords = useMemo(() => {
    return fillMissingDays(records);
  }, [records]);

  if (displayRecords.length === 0) {
    // Check trên displayRecords
    return (
      <Box className="text-center py-8 text-gray-400 text-sm italic">Chưa có dữ liệu chấm công</Box>
    );
  }

  return (
    <Box className="flex flex-col gap-4 px-2 pb-20">
      {/* 4. Render displayRecords thay vì records */}
      {displayRecords.map((rec, idx) => {
        return (
          <Box
            key={`${rec.date}-${idx}`}
            className={`flex flex-col w-full shadow-md bg-white rounded-xl p-4 border ${
              (rec as any).isAbsent ? 'border-red-200 bg-red-50/20' : 'border-gray-100'
            }`}
          >
            <Text className="font-bold text-lg mb-3 pb-2 border-b border-gray-200 text-gray-800">
              {formatDateDisplay(rec.date)}
            </Text>

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

              <ShiftStatusBadge
                checkIn={rec.shifts.morning.checkIn}
                checkOut={rec.shifts.morning.checkOut}
                shiftIndex={0}
                dateStr={rec.date}
                leaves={leaves}
              />
            </Box>

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

              <ShiftStatusBadge
                checkIn={rec.shifts.afternoon.checkIn}
                checkOut={rec.shifts.afternoon.checkOut}
                shiftIndex={1}
                dateStr={rec.date}
                leaves={leaves}
              />
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default History;
