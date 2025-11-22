import { useState, useEffect, useMemo } from 'react';
import { Box, Text } from 'zmp-ui';
import TimeDisplay from '@/components/display/clock';
import { useRecoilValue } from 'recoil';
import {
  todayRecordSelector,
  currentShiftIndexSelector,
  currentShiftSelector,
} from '@/states/state';
import { useAttendanceActions } from '@/hooks/useAttendanceActions';
import { timeStringToDateToday } from '@/lib/utils';

// --- Helpers ---
const formatDuration = (ms: number) => {
  if (ms < 0) ms = 0;
  const s = Math.floor((ms / 1000) % 60)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((ms / 60000) % 60)
    .toString()
    .padStart(2, '0');
  const h = Math.floor(ms / 3600000)
    .toString()
    .padStart(2, '0');
  return `${h}:${m}:${s}`;
};

// --- Hooks ---
const useCurrentTime = (interval = 1000) => {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(timer);
  }, [interval]);
  return now;
};

const useShiftStatus = (
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
      // Chưa check-in
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

type RollCallProps = {
  checkLocation: () => Promise<boolean>;
  locationLoading: boolean;
  distance: number | null;
  locationError: string | null;
  MAX_DISTANCE: number;
};

export const RollCall: React.FC<RollCallProps> = ({
  checkLocation,
  locationLoading,
  distance,
  locationError,
  MAX_DISTANCE,
}) => {
  const rec = useRecoilValue(todayRecordSelector);
  const currentShiftIdx = useRecoilValue(currentShiftIndexSelector);
  const currentShift = useRecoilValue(currentShiftSelector);
  const { checkIn, checkOut } = useAttendanceActions();

  const [isProcessing, setIsProcessing] = useState(false);
  const now = useCurrentTime();

  const shiftKey = useMemo(
    () => (currentShiftIdx === 0 ? 'morning' : currentShiftIdx === 1 ? 'afternoon' : null),
    [currentShiftIdx]
  );

  const hasInCurrentShift = Boolean(shiftKey && rec?.shifts?.[shiftKey]?.checkIn);
  const hasOutCurrentShift = Boolean(shiftKey && rec?.shifts?.[shiftKey]?.checkOut);

  const status = useShiftStatus(currentShift, shiftKey, hasInCurrentShift, hasOutCurrentShift, now);

  const handleAttendance = async (type: 'in' | 'out') => {
    if (isProcessing || locationLoading) return;
    setIsProcessing(true);

    const isLocationValid = await checkLocation();
    if (isLocationValid) {
      try {
        if (type === 'in') await checkIn();
        else await checkOut();
      } catch (error) {
        console.error(`Check-${type} error:`, error);
      }
    }
    setIsProcessing(false);
  };

  const isLoading = locationLoading || isProcessing;

  // Render helpers
  const renderLocationStatus = () => {
    if (locationLoading)
      return (
        <Text size="small" className="text-blue-500">
          Đang kiểm tra vị trí...
        </Text>
      );
    if (locationError)
      return (
        <Text size="small" className="text-red-500">
          {locationError}
        </Text>
      );
    if (distance === null)
      return (
        <Text size="small" className="text-gray-500">
          Vị trí sẽ được kiểm tra khi bấm nút.
        </Text>
      );

    const isOutOfRange = distance > MAX_DISTANCE;
    return (
      <Text color={isOutOfRange ? 'red' : 'green'}>
        📍 Bạn đang {isOutOfRange ? 'ở ngoài' : 'trong'} phạm vi (<b>{distance.toFixed(0)}m</b>)
      </Text>
    );
  };

  return (
    <Box className="shadow-lg bg-white rounded-2xl pt-10 p-3.5 mx-2">
      <Box className="text-center pb-4">
        <TimeDisplay />
        <Text>Giờ hiện tại</Text>
      </Box>

      <Box className="flex justify-center mb-4 bg-blue-100 rounded-lg p-3 text-center">
        {renderLocationStatus()}
      </Box>

      <Box
        className={`flex justify-center mt-10 rounded-lg p-3 text-center transition-all ${status.bg}`}
      >
        <Text className={`font-medium ${status.color} text-sm`}>{status.text}</Text>
      </Box>

      <Box className="flex flex-row gap-2 pb-5 mt-3">
        <ActionButton
          onClick={() => handleAttendance('in')}
          disabled={hasInCurrentShift || !status.canIn || isLoading}
          label={
            hasInCurrentShift ? 'Đã điểm danh vào' : status.canIn ? 'Điểm danh vào' : 'Chưa tới giờ'
          }
        />
        <ActionButton
          onClick={() => handleAttendance('out')}
          disabled={!hasInCurrentShift || hasOutCurrentShift || !status.canOut || isLoading}
          label={
            !hasInCurrentShift
              ? 'Chưa điểm danh vào'
              : hasOutCurrentShift
              ? 'Đã điểm danh về'
              : status.canOut
              ? 'Điểm danh về'
              : 'Chưa tới giờ'
          }
        />
      </Box>
    </Box>
  );
};

// Sub-component for button to keep JSX clean
const ActionButton = ({
  onClick,
  disabled,
  label,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex w-full justify-center p-3 text-white rounded-xl transition-colors ${
      disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600'
    }`}
  >
    {label}
  </button>
);

export default RollCall;
