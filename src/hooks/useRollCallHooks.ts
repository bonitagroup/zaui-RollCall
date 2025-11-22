import { useState, useEffect, useMemo } from 'react';
import { timeStringToDateToday } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';

export const useCurrentTime = (interval = 1000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
};

export const useShiftStatus = (
  currentShift: any,
  shiftKey: string | null,
  hasIn: boolean,
  hasOut: boolean,
  now: Date
) => {
  return useMemo(() => {
    if (!currentShift || !shiftKey) {
      return {
        text: 'Không trong ca làm việc',
        color: 'text-gray-500',
        bg: 'bg-gray-100',
        canIn: false,
        canOut: false,
      };
    }

    const tInStart = timeStringToDateToday(currentShift.checkInStart).getTime();
    const tInDeadline = timeStringToDateToday(currentShift.checkInDeadline).getTime();
    const tInEnd = timeStringToDateToday(currentShift.checkInEnd).getTime();
    const tOutStart = timeStringToDateToday(currentShift.checkOutStart).getTime();
    const tOutEnd = timeStringToDateToday(currentShift.checkOutEnd).getTime();

    const nowMs = now.getTime();

    let text = 'Đang trong ca làm việc';
    let color = 'text-blue-600';
    let bg = 'bg-blue-100';

    if (hasIn && hasOut) {
      text = 'Đã hoàn thành ca làm việc';
      color = 'text-green-700';
      bg = 'bg-green-100';
    } else if (hasIn && !hasOut) {
      if (nowMs < tOutStart) {
        text = `Còn ${formatDuration(tOutStart - nowMs)} đến giờ điểm danh về`;
        color = 'text-blue-600';
        bg = 'bg-blue-100';
      } else if (nowMs >= tOutStart && nowMs <= tOutEnd) {
        text = `Hết hạn điểm danh về sau ${formatDuration(tOutEnd - nowMs)}`;
        color = 'text-green-600';
        bg = 'bg-green-50';
      } else {
        text = 'Đã quá giờ điểm danh về';
        color = 'text-red-600';
        bg = 'bg-red-50';
      }
    } else {
      if (nowMs < tInStart) {
        const diff = tInStart - nowMs;
        if (diff <= 30 * 60000) {
          text = `Mở điểm danh vào sau ${formatDuration(diff)}`;
          color = 'text-blue-600';
          bg = 'bg-blue-50';
        } else {
          text = `Sắp đến giờ ${currentShift.name}`;
          color = 'text-gray-600';
          bg = 'bg-gray-100';
        }
      } else if (nowMs >= tInStart && nowMs <= tInDeadline) {
        text = `Hết hạn điểm danh vào sau: ${formatDuration(tInDeadline - nowMs)}`;
        color = 'text-orange-600';
        bg = 'bg-orange-50';
      } else if (nowMs > tInDeadline) {
        text = 'Đã quá giờ điểm danh vào';
        color = 'text-red-600';
        bg = 'bg-red-50';
      }
    }

    const canIn = nowMs >= tInStart && nowMs <= tInEnd;
    const canOut = nowMs >= tOutStart && nowMs <= tOutEnd;

    return { text, color, bg, canIn, canOut };
  }, [now, currentShift, shiftKey, hasIn, hasOut]);
};
