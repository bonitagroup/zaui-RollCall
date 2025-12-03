import React, { useEffect } from 'react';
import { Box, Text, Button, Icon } from 'zmp-ui';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { calendarDateState, monthlyStatsState, calendarSummarySelector } from '@/states/state';
import { User } from '@/types/users';
import api from '@/lib/api';
import { mapDbRecordToFrontend, recomputeState, checkSessionLeave, config } from '@/lib/utils';

const getSafeDateStr = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getShiftTime = (shiftIdx: number, type: 'deadline' | 'outStart') => {
  const s = config.shifts[shiftIdx];
  return type === 'deadline' ? s.checkInDeadline : s.checkOutStart;
};

const compareTime = (iso: string | null | undefined, targetTimeStr: string, mode: '>' | '<') => {
  if (!iso) return false;
  const d = new Date(iso);
  const [h, m] = targetTimeStr.split(':').map(Number);
  const timeVal = d.getHours() * 60 + d.getMinutes();
  const targetVal = h * 60 + m;
  return mode === '>' ? timeVal > targetVal : timeVal < targetVal;
};

const StatBox = ({ value, label, color }: { value: number; label: string; color?: string }) => (
  <Box className="flex flex-col items-center justify-center p-2">
    <Text className={`text-2xl font-bold ${color || 'text-white'}`}>{value}</Text>
    <Text size="xxSmall" className="text-blue-100 uppercase font-medium mt-1 opacity-80">
      {label}
    </Text>
  </Box>
);

const CalendarView: React.FC<{ user: User }> = ({ user }) => {
  const [currentDate, setCurrentDate] = useRecoilState(calendarDateState);
  const setStats = useSetRecoilState(monthlyStatsState);
  const { records, leaves } = useRecoilValue(monthlyStatsState);
  const summary = useRecoilValue(calendarSummarySelector);
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
  }, [user.zalo_id, currentMonth, currentYear, setStats]);

  const navigateMonth = (dir: 'prev' | 'next') => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + (dir === 'next' ? 1 : -1));
    setCurrentDate(d);
  };

  const getMonthDays = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    const daysInMonth = lastDay.getDate();
    const firstDayOfWeek = firstDay.getDay();
    const days: any[] = [];

    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push({ date: new Date(currentYear, currentMonth - 1, 0), isEmpty: true });
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(currentYear, currentMonth - 1, i), isEmpty: false });
    }
    return days;
  };

  const getShiftStatuses = (date: Date) => {
    const dateStr = getSafeDateStr(date);
    const todayStr = getSafeDateStr(new Date());

    const isFuture = dateStr > todayStr;
    const isSunday = date.getDay() === 0;

    if (isSunday) return { morning: 'sunday', afternoon: 'sunday' };

    const rec = records.find((r) => r.date === dateStr);

    const resolveStatus = (shiftData: any, session: 'morning' | 'afternoon', shiftIdx: number) => {
      if (shiftData?.checkIn && shiftData?.checkOut) {
        const isLate = compareTime(shiftData.checkIn, getShiftTime(shiftIdx, 'deadline'), '>');
        const isEarly = compareTime(shiftData.checkOut, getShiftTime(shiftIdx, 'outStart'), '<');
        if (isLate && isEarly) return 'late-early';
        if (isLate) return 'late';
        if (isEarly) return 'early';
        return 'done';
      }

      if (checkSessionLeave(dateStr, session, leaves)) {
        return 'leave';
      }

      if (isFuture) return 'future';
      return 'absent';
    };

    return {
      morning: resolveStatus(rec?.shifts?.morning, 'morning', 0),
      afternoon: resolveStatus(rec?.shifts?.afternoon, 'afternoon', 1),
    };
  };

  const getShiftDots = (statuses: any) => {
    if (statuses.morning === 'sunday') return [];
    const getDotColor = (status: string) => {
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
        case 'future':
          return 'bg-gray-200';
        default:
          return 'bg-transparent';
      }
    };
    return [{ color: getDotColor(statuses.morning) }, { color: getDotColor(statuses.afternoon) }];
  };

  return (
    <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 pt-6 pb-8 px-4 text-white rounded-b-[32px] shadow-xl mb-4">
      <Box className="bg-white/10 backdrop-blur-md rounded-2xl p-3 mb-6 border border-white/20">
        <Box className="grid grid-cols-3 divide-x divide-white/10 border-b border-white/10 pb-3">
          <StatBox value={summary.worked} label="Ngày công" />
          <StatBox value={summary.absent} label="Vắng mặt" color="text-red-300" />
          <StatBox value={summary.leave} label="Nghỉ phép" color="text-purple-300" />
        </Box>

        <Box className="grid grid-cols-2 divide-x divide-white/10 pt-3">
          <StatBox value={summary.late} label="Đi Muộn" color="text-yellow-300" />
          <StatBox value={summary.early} label="Về Sớm" color="text-cyan-300" />
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
            const dots = getShiftDots(shiftStatuses);
            const isToday = getSafeDateStr(d.date) === getSafeDateStr(new Date());

            return (
              <Box
                key={i}
                className={`h-12 rounded-lg flex flex-col items-center justify-center text-sm font-semibold transition-all relative 
                  ${
                    isToday
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-800 hover:bg-gray-100'
                  }
                `}
              >
                <Text className="text-xs mb-1">{d.date.getDate()}</Text>
                <Box className="flex space-x-1">
                  {dots.map((dot: any, index: number) => (
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
