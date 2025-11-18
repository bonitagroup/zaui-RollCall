import { Box, Text } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { historyRecordsSelector } from '@/states/state';
import { getAttendanceStatus, formatDateDisplay, formatTimeDisplay } from '@/lib/utils';

export const History = (): JSX.Element => {
  const historyRecords = useRecoilValue(historyRecordsSelector);

  return (
    <Box className="gap-4 px-2 flex flex-col">
      {historyRecords.length === 0 ? (
        <Box className="text-center text-gray-500 py-4">
          <Text>Chưa có dữ liệu</Text>
        </Box>
      ) : (
        historyRecords.map((rec) => {
          const morningStatus = getAttendanceStatus({
            ...rec,
            checkIn: rec.shifts?.morning?.checkIn ?? undefined,
            checkOut: rec.shifts?.morning?.checkOut ?? undefined,
            checkInShiftIndex: 0,
            checkOutShiftIndex: 0,
          });
          const afternoonStatus = getAttendanceStatus({
            ...rec,
            checkIn: rec.shifts?.afternoon?.checkIn ?? undefined,
            checkOut: rec.shifts?.afternoon?.checkOut ?? undefined,
            checkInShiftIndex: 1,
            checkOutShiftIndex: 1,
          });
          return (
            <Box
              key={rec.date}
              className="flex flex-col w-full shadow-lg text-left bg-white rounded-xl p-4"
            >
              <Text className="font-bold text-lg mb-3 pb-3 border-b border-gray-300">
                {formatDateDisplay(rec.date)}
              </Text>
              <Box className="flex flex-row justify-between mb-3 pb-3 border-b border-gray-200">
                <Text className="text-sm font-semibold text-gray-500 mb-1">
                  Ca sáng: {formatTimeDisplay(rec.shifts?.morning?.checkIn || undefined)} -{' '}
                  {formatTimeDisplay(rec.shifts?.morning?.checkOut || undefined)}
                </Text>
                <Text className="text-xs text-blue-600 font-bold">{morningStatus}</Text>
              </Box>
              <Box className="flex flex-row justify-between">
                <Text className="text-sm font-semibold text-gray-500 mb-1">
                  Ca chiều: {formatTimeDisplay(rec.shifts?.afternoon?.checkIn || undefined)} -{' '}
                  {formatTimeDisplay(rec.shifts?.afternoon?.checkOut || undefined)}
                </Text>
                <Text className="text-xs text-blue-600 font-bold">{afternoonStatus}</Text>
              </Box>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default History;
