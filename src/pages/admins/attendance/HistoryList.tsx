import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, Icon } from 'zmp-ui';
import { User } from '@/types/users';
import api from '@/lib/api';
import {
  formatDateDisplay,
  formatTimeDisplay,
  mapDbRecordToFrontend,
  recomputeState,
  config,
} from '@/lib/utils';
import { AttendanceRecord } from '@/types/rollcalls';

const HistoryList: React.FC<{ user: User }> = ({ user }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const LIMIT = 20;
  const observerTarget = useRef<HTMLDivElement | null>(null);

  const loadHistory = useCallback(
    async (offset: number) => {
      if (loading || !user.zalo_id) return;
      setLoading(true);
      try {
        const res: any = await api.get('/attendance/history-paging', {
          params: { zalo_id: user.zalo_id, limit: LIMIT, offset },
        });
        if (res.success && Array.isArray(res.data)) {
          if (res.data.length < LIMIT) setHasMore(false);

          const processedRecords = res.data.map((item: any) =>
            recomputeState(mapDbRecordToFrontend(item))
          );

          setRecords((prev) => [...prev, ...processedRecords]);
        } else {
          setHasMore(false);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    },
    [user.zalo_id, loading]
  );

  useEffect(() => {
    setRecords([]);
    setPage(0);
    setHasMore(true);
    loadHistory(0);
  }, [user.zalo_id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadHistory(nextPage * LIMIT);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, loading, page, loadHistory]);

  const getLateMinutes = (timeStr: string | null, deadlineStr: string) => {
    if (!timeStr) return 0;
    const d = new Date(timeStr);
    const [h, m] = deadlineStr.split(':').map(Number);
    const checkInTime = d.getHours() * 60 + d.getMinutes();
    const deadlineTime = h * 60 + m;
    return Math.max(0, checkInTime - deadlineTime);
  };

  const getEarlyMinutes = (timeStr: string | null, earlyStr: string) => {
    if (!timeStr) return 0;
    const d = new Date(timeStr);
    const [h, m] = earlyStr.split(':').map(Number);
    const checkOutTime = d.getHours() * 60 + d.getMinutes();
    const earlyTime = h * 60 + m;
    return Math.max(0, earlyTime - checkOutTime);
  };

  // Logic hiển thị trạng thái chi tiết
  const renderShiftStatus = (
    checkIn: string | null,
    checkOut: string | null,
    shiftIndex: number
  ) => {
    const shiftConfig = config.shifts[shiftIndex];

    // 1. Vắng mặt
    if (!checkIn || (checkIn && !checkOut)) {
      return <Text className="text-xs font-bold text-red-600">Vắng mặt</Text>;
    }

    // 2. Tính toán lỗi thời gian
    const lateMin = getLateMinutes(checkIn, shiftConfig.checkInDeadline);
    // Ca sáng (idx 0) và Ca chiều (idx 1) đều check về sớm dựa trên checkOutStart
    const earlyMin = getEarlyMinutes(checkOut, shiftConfig.checkOutStart);

    const errors: string[] = [];
    if (lateMin > 0) errors.push(`Muộn ${lateMin}p`);
    if (earlyMin > 0) errors.push(`Sớm ${earlyMin}p`);

    if (errors.length > 0) {
      if (lateMin > 0 && earlyMin > 0) {
        return <Text className="text-xs font-bold text-orange-600">{errors.join(' & ')}</Text>;
      }
      return <Text className="text-xs font-bold text-orange-600">{errors.join(', ')}</Text>;
    }

    return <Text className="text-xs font-bold text-green-600">Đúng giờ</Text>;
  };

  return (
    <Box className="px-4 pb-20">
      <Text className="font-bold text-lg mb-4 text-gray-800 pl-1">Lịch sử chi tiết</Text>
      <Box className="space-y-3">
        {records.map((rec, idx) => (
          <Box
            key={`${rec.date}-${idx}`}
            className="flex flex-col w-full shadow-md bg-white rounded-xl p-4 border border-gray-100"
          >
            <Text className="font-bold text-lg mb-3 pb-3 border-b border-gray-200 text-gray-800">
              {formatDateDisplay(rec.date)}
            </Text>

            {/* Ca sáng */}
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
              {renderShiftStatus(rec.shifts.morning.checkIn, rec.shifts.morning.checkOut, 0)}
            </Box>

            {/* Ca chiều */}
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
              {renderShiftStatus(rec.shifts.afternoon.checkIn, rec.shifts.afternoon.checkOut, 1)}
            </Box>
          </Box>
        ))}
      </Box>

      <div ref={observerTarget} className="py-6 text-center">
        {loading && (
          <Text size="xSmall" className="text-gray-400">
            Đang tải...
          </Text>
        )}
        {!hasMore && records.length === 0 && (
          <Text size="xSmall" className="text-gray-400">
            Chưa có dữ liệu
          </Text>
        )}
      </div>
    </Box>
  );
};

export default HistoryList;
