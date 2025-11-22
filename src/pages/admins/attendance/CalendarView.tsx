import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, Button, Icon } from 'zmp-ui';
import { User } from '@/types/users';
import api from '@/lib/api';
import { config, mapDbRecordToFrontend, recomputeState } from '@/lib/utils';
import { AttendanceRecord } from '@/types/rollcalls';

interface DayData {
  date: Date;
  isEmpty: boolean;
}

interface CalendarViewProps {
  user: User;
}

const getSafeDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getShiftTime = (shiftIdx: number, type: 'deadline' | 'outStart') => {
  const s = config.shifts[shiftIdx];
  if (type === 'deadline') return s.checkInDeadline;
  return s.checkOutStart;
};

const compareTime = (iso: string | null | undefined, targetTimeStr: string, mode: '>' | '<') => {
  if (!iso) return false;
  const d = new Date(iso);
  const [h, m] = targetTimeStr.split(':').map(Number);
  const timeVal = d.getHours() * 60 + d.getMinutes();
  const targetVal = h * 60 + m;
  return mode === '>' ? timeVal > targetVal : timeVal < targetVal;
};

const CalendarView: React.FC<CalendarViewProps> = ({ user }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [stats, setStats] = useState<{ records: AttendanceRecord[]; leaves: any[] }>({
    records: [],
    leaves: [],
  });

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    const fetchStats = async () => {
      if (!user.zalo_id) return;
      try {
        const res: any = await api.get('/attendance/monthly-stats', {
          params: { zalo_id: user.zalo_id, month: currentMonth, year: currentYear },
        });
        if (res.success) {
          const standardizedRecords = (res.data.records || []).map((r: any) =>
            recomputeState(mapDbRecordToFrontend(r))
          );

          setStats({
            records: standardizedRecords,
            leaves: res.data.leaves || [],
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, [user.zalo_id, currentMonth, currentYear]);

  const summary = useMemo(() => {
    let worked = 0;
    let late = 0;
    let early = 0;
    let absent = 0;
    let leave = 0;

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dateStr = getSafeDateStr(d);
      const isSunday = d.getDay() === 0;

      if (isSunday) continue;

      if (d.getTime() >= today.getTime()) {
        continue;
      }

      const rec = stats.records.find((r) => r.date === dateStr);
      const leaveReq = stats.leaves.find(
        (l: any) => new Date(l.start_date) <= d && new Date(l.end_date) >= d
      );

      if (leaveReq) {
        leave++;
        continue;
      }

      if (!rec) {
        absent += 2;
        continue;
      }

      const processShift = (shift: any, shiftIdx: number) => {
        if (!shift.checkIn || (shift.checkIn && !shift.checkOut)) {
          absent += 1;
          return;
        }

        worked += 0.5;

        if (compareTime(shift.checkIn, getShiftTime(shiftIdx, 'deadline'), '>')) {
          late++;
        }
        if (compareTime(shift.checkOut, getShiftTime(shiftIdx, 'outStart'), '<')) {
          early++;
        }
      };

      processShift(rec.shifts.morning, 0);
      processShift(rec.shifts.afternoon, 1);
    }

    return { worked, late, early, leave, absent };
  }, [stats, currentMonth, currentYear]);

  const getMonthDays = (): DayData[] => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    const days: DayData[] = [];
    for (let i = 0; i < firstDayOfWeek; i++)
      days.push({ date: new Date(currentYear, currentMonth - 1, 0), isEmpty: true });
    for (let i = 1; i <= daysInMonth; i++)
      days.push({ date: new Date(currentYear, currentMonth - 1, i), isEmpty: false });
    return days;
  };

  const navigateMonth = (dir: 'prev' | 'next') => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
    setCurrentDate(d);
  };

  const getShiftStatuses = (date: Date): { morning: string; afternoon: string } => {
    const dateStr = getSafeDateStr(date);
    const today = getSafeDateStr(new Date());
    const isFuture = date > new Date();
    const isSunday = date.getDay() === 0;

    if (dateStr === today) return { morning: 'today', afternoon: 'today' };
    if (isFuture) return { morning: 'future', afternoon: 'future' };
    if (isSunday) return { morning: 'sunday', afternoon: 'sunday' };

    const isLeave = stats.leaves?.find(
      (l: any) => new Date(l.start_date) <= date && new Date(l.end_date) >= date
    );
    if (isLeave) return { morning: 'leave', afternoon: 'leave' };

    const rec = stats.records?.find((r) => r.date === dateStr);
    if (!rec) return { morning: 'absent', afternoon: 'absent' };

    const getStatus = (shift: any, idx: number) => {
      if (!shift.checkIn || (shift.checkIn && !shift.checkOut)) return 'absent';

      if (shift.checkIn && shift.checkOut) {
        const isLate = compareTime(shift.checkIn, getShiftTime(idx, 'deadline'), '>');
        const isEarly = compareTime(shift.checkOut, getShiftTime(idx, 'outStart'), '<');

        if (isLate && isEarly) return 'late-early';
        if (isLate) return 'late';
        if (isEarly) return 'early';
        return 'done';
      }
      return 'absent';
    };

    return {
      morning: getStatus(rec.shifts.morning, 0),
      afternoon: getStatus(rec.shifts.afternoon, 1),
    };
  };

  const getShiftDots = (statuses: { morning: string; afternoon: string }) => {
    if (
      statuses.morning === 'today' ||
      statuses.morning === 'future' ||
      statuses.morning === 'sunday'
    )
      return [];

    const getDotColor = (status: string): string => {
      switch (status) {
        case 'done':
          return 'bg-green-500';
        case 'leave':
          return 'bg-purple-500';
        case 'late':
          return 'bg-yellow-500';
        case 'early':
          return 'bg-cyan-500';
        case 'late-early':
          return 'bg-gray-600';
        case 'absent':
          return 'bg-red-500';
        default:
          return 'bg-gray-300';
      }
    };
    return [{ color: getDotColor(statuses.morning) }, { color: getDotColor(statuses.afternoon) }];
  };

  const getDayBaseClass = (
    date: Date,
    shiftStatuses: { morning: string; afternoon: string }
  ): string => {
    const dateStr = getSafeDateStr(date);
    const today = getSafeDateStr(new Date());
    const isSunday = date.getDay() === 0;
    const isFuture = date > new Date();

    if (dateStr === today) return 'bg-blue-600 text-white shadow-lg font-bold';
    if (isSunday || isFuture) return 'bg-transparent text-gray-300';
    return 'bg-gray-100 text-gray-800 border border-gray-200 hover:bg-gray-100 transition-all';
  };

  return (
    <Box className="bg-gradient-to-br from-blue-600 to-purple-700 pt-6 pb-8 px-4 text-white rounded-b-[32px] shadow-xl mb-4">
      <Box className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-6 border border-white/20 grid grid-cols-4 divide-x divide-white/20">
        <Box className="text-center px-1">
          <Text className="text-xl font-bold">{summary.worked}</Text>
          <Text size="xxSmall" className="opacity-80 uppercase mt-1">
            Ngày Công
          </Text>
        </Box>
        <Box className="text-center px-1">
          <Text className="text-xl font-bold text-yellow-300">{summary.late}</Text>
          <Text size="xxSmall" className="opacity-80 uppercase mt-1">
            Về Muộn
          </Text>
        </Box>
        <Box className="text-center px-1">
          <Text className="text-xl font-bold text-cyan-300">{summary.early}</Text>
          <Text size="xxSmall" className="opacity-80 uppercase mt-1">
            Về Sớm
          </Text>
        </Box>
        <Box className="text-center px-1">
          <Text className="text-xl font-bold text-red-300">{summary.absent}</Text>
          <Text size="xxSmall" className="opacity-80 uppercase mt-1">
            Vắng mặt
          </Text>
        </Box>
      </Box>

      <Box className="bg-white rounded-2xl p-4 shadow-lg text-gray-800">
        <Box className="flex items-center justify-between mb-4">
          <Button
            onClick={() => navigateMonth('prev')}
            variant="tertiary"
            size="small"
            icon={<Icon icon="zi-chevron-left" />}
          />
          <Text className="font-bold text-lg">
            Tháng {currentMonth}, {currentYear}
          </Text>
          <Button
            onClick={() => navigateMonth('next')}
            variant="tertiary"
            size="small"
            icon={<Icon icon="zi-chevron-right" />}
          />
        </Box>

        <Box className="grid grid-cols-7 gap-1 mb-2">
          {['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map((d) => (
            <Text key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase">
              {d}
            </Text>
          ))}
        </Box>

        <Box className="grid grid-cols-7 gap-2">
          {getMonthDays().map((d, i) => {
            if (d.isEmpty) return <Box key={i} className="h-12" />;

            const shiftStatuses = getShiftStatuses(d.date);
            const baseClass = getDayBaseClass(d.date, shiftStatuses);
            const dots = getShiftDots(shiftStatuses);

            return (
              <Box
                key={i}
                className={`h-12 rounded-lg flex flex-col items-center justify-center text-sm font-semibold transition-all relative ${baseClass}`}
              >
                <Text className="text-xs mb-1">{d.date.getDate()}</Text>
                <Box className="flex space-x-1">
                  {dots.map((dot, index) => (
                    <Box key={index} className={`w-[5px] h-[5px] rounded-full ${dot.color}`} />
                  ))}
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box className="flex flex-wrap justify-center gap-3 mt-4 pt-3 border-t border-gray-100 text-[10px] text-gray-500 font-medium">
          <Box className="flex items-center">
            <Box className="w-2 h-2 rounded-full bg-green-500 mr-1" />
            Đủ
          </Box>
          <Box className="flex items-center">
            <Box className="w-2 h-2 rounded-full bg-yellow-500 mr-1" />
            Muộn
          </Box>
          <Box className="flex items-center">
            <Box className="w-2 h-2 rounded-full bg-cyan-500 mr-1" />
            Sớm
          </Box>
          <Box className="flex items-center">
            <Box className="w-2 h-2 rounded-full bg-gray-600 mr-1" />
            Muộn+Sớm
          </Box>
          <Box className="flex items-center">
            <Box className="w-2 h-2 rounded-full bg-red-500 mr-1" />
            Vắng
          </Box>
          <Box className="flex items-center">
            <Box className="w-2 h-2 rounded-full bg-purple-500 mr-1" />
            Nghỉ
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CalendarView;
