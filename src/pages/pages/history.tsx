import { Box, Text, Icon } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { historyRecordsSelector } from '@/states/state';
import { formatDateDisplay, formatTimeDisplay, calculateShiftStatus } from '@/lib/utils';

const History = (): JSX.Element => {
  const records = useRecoilValue(historyRecordsSelector);

  if (records.length === 0) {
    return (
      <Box className="text-center py-8 text-gray-400 text-sm italic">Chưa có dữ liệu chấm công</Box>
    );
  }

  return (
    <Box className="flex flex-col gap-4 px-2 pb-20">
      {records.map((rec, idx) => {
        const morning = calculateShiftStatus(
          rec.shifts.morning.checkIn,
          rec.shifts.morning.checkOut,
          0
        );
        const afternoon = calculateShiftStatus(
          rec.shifts.afternoon.checkIn,
          rec.shifts.afternoon.checkOut,
          1
        );

        return (
          <Box
            key={`${rec.date}-${idx}`}
            className="flex flex-col w-full shadow-md bg-white rounded-xl p-4 border border-gray-100"
          >
            <Text className="font-bold text-lg mb-3 pb-2 border-b border-gray-200 text-gray-800">
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
              <Text className={`text-xs font-bold ${morning.color}`}>{morning.text}</Text>
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
              <Text className={`text-xs font-bold ${afternoon.color}`}>{afternoon.text}</Text>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default History;
