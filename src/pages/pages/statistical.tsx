import { useRecoilValue } from 'recoil';
import { todayRecordSelector } from '@/states/state';
import { Box, Text } from 'zmp-ui';
import { getAttendanceStatus, msToHHMM } from '@/lib/utils';

const formatTime = (iso?: string) => {
  if (!iso) return '--:--:--';
  return new Date(iso).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
};
const getShortStatus = (status: string) => {
  if (status.includes('Về sớm')) return 'Về sớm';
  if (status.includes('Muộn') || status.includes('Đi muộn')) return 'Đi muộn';
  if (status.includes('Đúng giờ')) return 'Đúng giờ';
  return '-';
};

type StatisticalProps = {
  distance: number | null;
  locationError: string | null;
  locationLoading: boolean;
  MAX_DISTANCE: number;
  checkLocation: () => Promise<boolean>;
};

export const Statistical: React.FC<StatisticalProps> = ({
  distance,
  locationError,
  locationLoading,
  MAX_DISTANCE,
  checkLocation,
}) => {
  const rec = useRecoilValue(todayRecordSelector);

  const getTime = (iso?: string | null) => (iso ? new Date(iso).getTime() : 0);

  const latestCheckInTime = Math.max(
    getTime(rec?.shifts?.morning?.checkIn),
    getTime(rec?.shifts?.afternoon?.checkIn)
  );

  const latestCheckInISO =
    latestCheckInTime > 0 ? new Date(latestCheckInTime).toISOString() : undefined;
  const latestTime = rec?.checkOut || latestCheckInISO;
  const latestTimeLabel = rec?.checkOut ? 'Giờ ra' : 'Giờ vào';

  const statusText = getShortStatus(getAttendanceStatus(rec));
  const workTime = rec?.totalWorkedMs ? msToHHMM(rec.totalWorkedMs) : '--:--';

  const handleLocationClick = () => {
    if (locationLoading) return;
    checkLocation();
  };

  return (
    <Box className="grid grid-cols-2 gap-4 px-2">
      <Box className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4">
        <Text className="font-bold text-3xl">{formatTime(latestTime)}</Text>
        <Text className="text-lg pt-1 text-gray-600">{latestTimeLabel}</Text>
      </Box>
      <Box className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4">
        <Text className="font-bold text-3xl">{workTime}</Text>
        <Text className="text-lg pt-1 text-gray-600">Thời gian làm</Text>
      </Box>
      <Box className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4">
        <Text className="font-bold text-3xl">{statusText}</Text>
        <Text className="text-lg pt-1 text-gray-600">Trạng thái</Text>
      </Box>
      <Box
        onClick={handleLocationClick}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4 cursor-pointer"
      >
        <Text
          className="font-bold text-3xl"
          style={{ color: distance !== null && distance > MAX_DISTANCE ? 'red' : 'green' }}
        >
          {locationLoading ? '...' : distance !== null ? `${distance.toFixed(0)} m` : '--'}
        </Text>
        <Text className="text-lg pt-1 text-gray-600">Khoảng cách</Text>
        {locationError && (
          <Text size="xSmall" color="red">
            {locationError}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default Statistical;
