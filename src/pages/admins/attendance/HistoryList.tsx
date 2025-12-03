import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'; // 1. Thêm useMemo
import { Box, Text, Icon } from 'zmp-ui';
import { User } from '@/types/users';
import api from '@/lib/api';
import {
  formatDateDisplay,
  formatTimeDisplay,
  mapDbRecordToFrontend,
  recomputeState,
  fillMissingDays, // 2. Import hàm fillMissingDays
} from '@/lib/utils';
import { AttendanceRecord } from '@/types/rollcalls';
import { ShiftStatusBadge } from '@/components/common/ShiftStatusBadge';

const HistoryList: React.FC<{ user: User }> = ({ user }) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Lấy danh sách đơn nghỉ phép
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

  // Load dữ liệu từ API
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

  // Reset khi đổi user
  useEffect(() => {
    setRecords([]);
    setHasMore(true);
    loadHistory(0);
  }, [user.zalo_id]);

  // Infinite Scroll
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

  // 3. LOGIC MỚI: Tự động lấp đầy ngày vắng
  const displayRecords = useMemo(() => {
    // Hàm này sẽ lấy records hiện có, tự động chèn thêm các ngày bị thiếu (Vắng mặt)
    return fillMissingDays(records);
  }, [records]);

  return (
    <Box className="px-4 pb-20">
      <Text className="font-bold text-lg mb-4 text-gray-800 pl-1">Lịch sử chi tiết</Text>
      <Box className="space-y-3">
        {/* Render displayRecords thay vì records */}
        {displayRecords.map((rec, idx) => (
          <Box
            key={`${rec.date}-${idx}`}
            className={`flex flex-col w-full shadow-md bg-white rounded-xl p-4 border ${
              // Nếu là bản ghi tự tạo (vắng mặt) thì đổi màu viền/nền nhẹ để phân biệt
              (rec as any).isAbsent ? 'border-red-200 bg-red-50/20' : 'border-gray-100'
            }`}
          >
            <Text className="font-bold text-lg mb-3 pb-3 border-b border-gray-200 text-gray-800">
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

              <ShiftStatusBadge
                checkIn={rec.shifts.morning.checkIn}
                checkOut={rec.shifts.morning.checkOut}
                shiftIndex={0}
                dateStr={rec.date}
                leaves={leaves}
              />
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

              <ShiftStatusBadge
                checkIn={rec.shifts.afternoon.checkIn}
                checkOut={rec.shifts.afternoon.checkOut}
                shiftIndex={1}
                dateStr={rec.date}
                leaves={leaves}
              />
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
