import React from 'react';
import { Text } from 'zmp-ui';
import { calculateShiftStatus, checkSessionLeave } from '@/lib/utils';

interface Props {
  checkIn?: string | null;
  checkOut?: string | null;
  shiftIndex: 0 | 1;
  dateStr: string;
  leaves: any[];
}

export const ShiftStatusBadge: React.FC<Props> = ({
  checkIn,
  checkOut,
  shiftIndex,
  dateStr,
  leaves,
}) => {
  if (checkIn && checkOut) {
    const status = calculateShiftStatus(checkIn, checkOut, shiftIndex);
    return <Text className={`text-xs font-bold ${status.color}`}>{status.text}</Text>;
  }

  const sessionName = shiftIndex === 0 ? 'morning' : 'afternoon';
  if (checkSessionLeave(dateStr, sessionName, leaves)) {
    return <Text className="text-xs font-bold text-purple-600">Nghỉ phép</Text>;
  }

  const todayStr = new Date().toISOString().split('T')[0];
  if (dateStr > todayStr) {
    return <Text className="text-xs font-bold text-gray-400">--</Text>;
  }

  return <Text className="text-xs font-bold text-red-500">Vắng mặt</Text>;
};
