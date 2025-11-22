import { useState, useMemo } from 'react';
import { Box, Text } from 'zmp-ui';
import TimeDisplay from '@/components/display/clock';
import { useRecoilValue } from 'recoil';
import {
  todayRecordSelector,
  currentShiftIndexSelector,
  currentShiftSelector,
} from '@/states/state';
import { useAttendanceActions } from '@/hooks/useAttendanceActions';
// Import các phần mới vừa tạo
import { useCurrentTime, useShiftStatus } from '@/hooks/useRollCallHooks';
import { ActionButton } from '@/components/rollcall/ActionButton';

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

  // Sử dụng hook mới
  const now = useCurrentTime();

  const shiftKey = useMemo(
    () => (currentShiftIdx === 0 ? 'morning' : currentShiftIdx === 1 ? 'afternoon' : null),
    [currentShiftIdx]
  );

  const hasInCurrentShift = Boolean(shiftKey && rec?.shifts?.[shiftKey]?.checkIn);
  const hasOutCurrentShift = Boolean(shiftKey && rec?.shifts?.[shiftKey]?.checkOut);

  // Sử dụng hook mới để lấy status
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

export default RollCall;
