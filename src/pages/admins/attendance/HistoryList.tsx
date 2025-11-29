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
  checkSessionLeave,
} from '@/lib/utils';
import { AttendanceRecord } from '@/types/rollcalls';

const HistoryList: React.FC<{ user: User }> = ({ user }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;
  const observerTarget = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchLeaves = async () => {
      if (!user.zalo_id) return;
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
  }, [user.zalo_id]);

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

  const renderShiftStatus = (
    checkIn: string | null,
    checkOut: string | null,
    shiftIndex: 0 | 1,
    dateStr: string
  ) => {
    if (checkIn && checkOut) {
      const status = calculateShiftStatus(checkIn, checkOut, shiftIndex);
      return <Text className={`text-xs font-bold ${status.color}`}>{status.text}</Text>;
    }

    const sessionName = shiftIndex === 0 ? 'morning' : 'afternoon';
    const isLeave = checkSessionLeave(dateStr, sessionName, leaves);

    if (isLeave) {
      return <Text className="text-xs font-bold text-purple-600">Nghỉ phép</Text>;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    if (dateStr > todayStr) {
      return <Text className="text-xs font-bold text-gray-400">--</Text>;
    }

    return <Text className="text-xs font-bold text-red-500">Vắng</Text>;
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
