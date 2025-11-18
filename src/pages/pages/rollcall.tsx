import { useState } from 'react';
import { Box, Text } from 'zmp-ui';
import TimeDisplay from '@/components/display/clock';
import { useRecoilValue } from 'recoil';
import {
  todayRecordSelector,
  canCheckInNowSelector,
  canCheckOutNowSelector,
  currentShiftIndexSelector,
} from '@/states/state';
import { useAttendanceActions } from '@/hooks/useAttendanceActions';

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
  const canCheckIn = useRecoilValue(canCheckInNowSelector);
  const canCheckOut = useRecoilValue(canCheckOutNowSelector);
  const currentShiftIdx = useRecoilValue(currentShiftIndexSelector);

  const { checkIn, checkOut } = useAttendanceActions();

  const [isProcessing, setIsProcessing] = useState(false);

  const shiftKey = currentShiftIdx === 0 ? 'morning' : currentShiftIdx === 1 ? 'afternoon' : null;
  const hasInCurrentShift = shiftKey !== null && rec?.shifts && !!rec.shifts[shiftKey].checkIn;
  const hasOutCurrentShift = shiftKey !== null && rec?.shifts && !!rec.shifts[shiftKey].checkOut;

  const onIn = async () => {
    if (isProcessing || locationLoading) return;
    setIsProcessing(true);
    const isLocationValid = await checkLocation();
    if (isLocationValid) {
      try {
        await checkIn();
      } catch (error) {
        console.error('Check-in error:', error);
      }
    }
    setIsProcessing(false);
  };

  const onOut = async () => {
    if (isProcessing || locationLoading) return;
    setIsProcessing(true);
    const isLocationValid = await checkLocation();
    if (isLocationValid) {
      try {
        await checkOut();
      } catch (error) {
        console.error('Check-out error:', error);
      }
    }
    setIsProcessing(false);
  };

  const isLoading = locationLoading || isProcessing;

  return (
    <Box className="shadow-lg bg-white rounded-2xl pt-10 p-3.5 mx-2">
      <Box className="text-center pb-4">
        <TimeDisplay />
        <Text>Giờ hiện tại</Text>
      </Box>

      <Box className="flex justify-center mb-4 bg-blue-100 rounded-lg p-3 text-center">
        {locationLoading ? (
          <Text color="blue" size="small">
            Đang kiểm tra vị trí...
          </Text>
        ) : locationError ? (
          <Text color="red" size="small">
            {locationError}
          </Text>
        ) : distance !== null ? (
          distance > MAX_DISTANCE ? (
            <Text color="red">
              📍 Bạn đang ở ngoài phạm vi (<b>{distance.toFixed(0)}m</b>)
            </Text>
          ) : (
            <Text color="green">
              📍 Bạn đang trong phạm vi cho phép (<b>{distance.toFixed(0)}m</b>)
            </Text>
          )
        ) : (
          <Text className="text-gray-600" size="small">
            Vị trí sẽ được kiểm tra khi bấm nút.
          </Text>
        )}
      </Box>

      <Box className="flex flex-row gap-2 py-5">
        <button
          onClick={onIn}
          disabled={hasInCurrentShift || !canCheckIn || isLoading}
          className={`flex w-full justify-center p-3 text-white rounded-xl transition-colors ${
            hasInCurrentShift || !canCheckIn || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-600'
          }`}
        >
          {hasInCurrentShift ? 'Đã điểm danh vào' : canCheckIn ? 'Điểm danh vào' : 'Chưa tới giờ'}
        </button>
        <button
          onClick={onOut}
          disabled={!hasInCurrentShift || hasOutCurrentShift || !canCheckOut || isLoading}
          className={`flex w-full justify-center p-3 text-white rounded-xl transition-colors ${
            !hasInCurrentShift || hasOutCurrentShift || !canCheckOut || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-sky-500 hover:bg-sky-600'
          }`}
        >
          {!hasInCurrentShift
            ? 'Chưa điểm danh vào'
            : hasOutCurrentShift
            ? 'Đã điểm danh về'
            : canCheckOut
            ? 'Điểm danh về'
            : 'Chưa tới giờ'}
        </button>
      </Box>
    </Box>
  );
};

export default RollCall;
