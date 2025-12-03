import React, { useState } from 'react';
import { Box, Text } from 'zmp-ui';
import TimeDisplay from '@/components/display/clock';
import { useRecoilValue } from 'recoil';
import {
  todayRecordSelector,
  currentShiftSelector,
  currentShiftIndexSelector,
} from '@/states/state';
import { useAttendanceActions } from '@/hooks/useAttendanceActions';
import { useCurrentTime, useShiftStatus } from '@/hooks/useRollCallHooks';
import { ActionButton } from '@/components/rollcall/ActionButton';
import { config, timeStringToDateToday } from '@/lib/utils';

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
  const currentShift = useRecoilValue(currentShiftSelector);
  const currentShiftIdx = useRecoilValue(currentShiftIndexSelector);

  const shiftKey = currentShiftIdx === 0 ? 'morning' : currentShiftIdx === 1 ? 'afternoon' : null;

  const { checkIn, checkOut } = useAttendanceActions();
  const [isProcessing, setIsProcessing] = useState(false);
  const now = useCurrentTime();

  const status = useShiftStatus(
    currentShift,
    shiftKey,
    Boolean(shiftKey && rec?.shifts?.[shiftKey as 'morning' | 'afternoon']?.checkIn),
    Boolean(shiftKey && rec?.shifts?.[shiftKey as 'morning' | 'afternoon']?.checkOut),
    now
  );

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

  const isBefore = (timeStr: string) => now <= timeStringToDateToday(timeStr);
  const isAfter = (timeStr: string) => now >= timeStringToDateToday(timeStr);

  const morningShift = config.shifts[0];
  const afternoonShift = config.shifts[1];

  const hasInMorning = Boolean(rec?.shifts?.morning?.checkIn);
  const hasOutMorning = Boolean(rec?.shifts?.morning?.checkOut);

  const canInMorning = !hasInMorning && isBefore(morningShift.checkInEnd);
  const canOutMorning =
    hasInMorning &&
    !hasOutMorning &&
    now >= timeStringToDateToday(morningShift.checkOutStart) &&
    now < timeStringToDateToday(afternoonShift.checkInStart);

  const hasInAfternoon = Boolean(rec?.shifts?.afternoon?.checkIn);
  const hasOutAfternoon = Boolean(rec?.shifts?.afternoon?.checkOut);

  const canInAfternoon =
    !hasInAfternoon &&
    now >= timeStringToDateToday(afternoonShift.checkInStart) &&
    isBefore(afternoonShift.checkInEnd);

  const canOutAfternoon =
    hasInAfternoon && !hasOutAfternoon && isAfter(afternoonShift.checkOutStart);

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
      <Text className={isOutOfRange ? 'text-red-500' : 'text-green-500'}>
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
        className={`flex justify-center mt-4 mb-6 rounded-lg p-3 text-center transition-all ${status.bg}`}
      >
        <Text className={`font-medium ${status.color} text-sm`}>{status.text}</Text>
      </Box>

      <Box className="flex flex-col gap-4 pb-5">
        <Box>
          <Text className="font-bold text-gray-500 text-xs mb-2 uppercase">Ca Sáng</Text>
          <Box className="grid grid-cols-2 gap-3">
            <ActionButton
              onClick={() => handleAttendance('in')}
              disabled={!canInMorning || isLoading}
              label={hasInMorning ? 'Đã check in' : 'Check in'}
              className={hasInMorning ? 'bg-green-100 text-green-700 border-green-200' : ''}
            />
            <ActionButton
              onClick={() => handleAttendance('out')}
              disabled={!canOutMorning || isLoading}
              label={hasOutMorning ? 'Đã check out' : 'Check out'}
              className={hasOutMorning ? 'bg-gray-100 text-gray-500' : ''}
            />
          </Box>
        </Box>

        <Box>
          <Text className="font-bold text-gray-500 text-xs mb-2 uppercase">Ca Chiều</Text>
          <Box className="grid grid-cols-2 gap-3">
            <ActionButton
              onClick={() => handleAttendance('in')}
              disabled={!canInAfternoon || isLoading}
              label={hasInAfternoon ? 'Đã check in' : 'Check in'}
              className={hasInAfternoon ? 'bg-green-100 text-green-700 border-green-200' : ''}
            />
            <ActionButton
              onClick={() => handleAttendance('out')}
              disabled={!canOutAfternoon || isLoading}
              label={hasOutAfternoon ? 'Đã check out' : 'Check out'}
              className={hasOutAfternoon ? 'bg-gray-100 text-gray-500' : ''}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default RollCall;
