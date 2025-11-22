import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Text, Icon } from 'zmp-ui';
import { User } from '@/types/users';
import api from '@/lib/api';
import {
  formatDateDisplay,
  formatTimeDisplay,
  mapDbRecordToFrontend,
  recomputeState,
  calculateShiftStatus,
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
          loadHistory(records.length);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => {
      if (observerTarget.current) observer.unobserve(observerTarget.current);
    };
  }, [hasMore, loading, records.length, loadHistory]);

  return (
    <Box className="px-4 pb-20">
      <Text className="font-bold text-lg mb-4 text-gray-800 pl-1">Lịch sử chi tiết</Text>
      <Box className="space-y-3">
        {records.map((rec, idx) => {
          const morning = calculateShiftStatus(
            rec.shifts.morning.checkIn,
            rec.shifts.morning.checkOut,
            0
          );
          const afternoon = calculateShiftStatus(
            rec.shifts.afternoon.checkIn,
            rec.shifts.afternoon.checkOut,
            1
          );

          return (
            <Box
              key={`${rec.date}-${idx}`}
              className="flex flex-col w-full shadow-md bg-white rounded-xl p-4 border border-gray-100"
            >
              <Text className="font-bold text-lg mb-3 pb-3 border-b border-gray-200 text-gray-800">
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
                <Text className={`text-xs font-bold ${morning.color}`}>{morning.text}</Text>
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
                <Text className={`text-xs font-bold ${afternoon.color}`}>{afternoon.text}</Text>
              </Box>
            </Box>
          );
        })}
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
