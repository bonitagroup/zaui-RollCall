import React, { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { todayRecordSelector } from '@/states/state';
import { Box, Text } from 'zmp-ui';
import { msToHHMM, config, timeStringToDateToday } from '@/lib/utils';

const getDiffMinutes = (timeIso: string | null | undefined, targetTimeStr: string) => {
  if (!timeIso) return 0;
  const actual = new Date(timeIso).getTime();
  const target = timeStringToDateToday(targetTimeStr).getTime();
  return Math.floor((actual - target) / 60000);
};

const getDurationMs = (inIso: string | null, outIso: string | null) => {
  if (!inIso || !outIso) return 0;
  const start = new Date(inIso).getTime();
  const end = new Date(outIso).getTime();
  return Math.max(0, end - start);
};

const getStatusColor = (txt: string) => {
  if (txt === 'Đúng giờ' || txt === 'Đang làm việc') return 'text-green-600';
  if (txt.includes('Muộn')) return 'text-orange-600';
  if (txt.includes('Sớm')) return 'text-purple-600';
  if (txt === 'Vắng mặt') return 'text-red-600';
  return 'text-gray-800';
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

  const { latestLabel, latestTimeStr, statusText, workTime } = useMemo(() => {
    const { morning: am, afternoon: pm } = rec?.shifts || { morning: {}, afternoon: {} };
    const amCfg = config.shifts[0];
    const pmCfg = config.shifts[1];

    const actions = [
      { time: pm.checkOut, label: 'Giờ ra', type: 'PM_OUT' },
      { time: pm.checkIn, label: 'Giờ vào', type: 'PM_IN' },
      { time: am.checkOut, label: 'Giờ ra', type: 'AM_OUT' },
      { time: am.checkIn, label: 'Giờ vào', type: 'AM_IN' },
    ];

    const latest = actions.find((a) => a.time) || { time: null, label: 'Chưa chấm', type: 'NONE' };

    let status = '-';
    const now = new Date();

    switch (latest.type) {
      case 'PM_OUT':
        const pmLate = getDiffMinutes(pm.checkIn!, pmCfg.checkInDeadline);
        const pmEarly = getDiffMinutes(pm.checkOut!, pmCfg.checkOutStart);

        if (pmLate > 0 && pmEarly < 0) status = `Muộn ${pmLate}p & Sớm ${Math.abs(pmEarly)}p`;
        else if (pmLate > 0) status = `Muộn ${pmLate}p`;
        else if (pmEarly < 0) status = `Sớm ${Math.abs(pmEarly)}p`;
        else status = 'Đúng giờ';
        break;

      case 'PM_IN':
        const lateInPM = getDiffMinutes(pm.checkIn!, pmCfg.checkInDeadline);
        status = lateInPM > 0 ? `Muộn ${lateInPM}p` : 'Đang làm';
        break;

      case 'AM_OUT':
        const pmStart = timeStringToDateToday(pmCfg.checkInStart);
        if (now < pmStart) {
          status = '-';
        } else {
          const lateAM = getDiffMinutes(am.checkIn!, amCfg.checkInDeadline);
          status = lateAM > 0 ? `Sáng: Muộn ${lateAM}p` : 'Sáng: Đúng giờ';
        }
        break;

      case 'AM_IN':
        const lateInAM = getDiffMinutes(am.checkIn!, amCfg.checkInDeadline);
        status = lateInAM > 0 ? `Muộn ${lateInAM}p` : 'Đang làm';
        break;
    }

    const msMorning = getDurationMs(am.checkIn ?? null, am.checkOut ?? null);
    const msAfternoon = getDurationMs(pm.checkIn ?? null, pm.checkOut ?? null);

    const totalMs = msMorning + msAfternoon;

    return {
      latestLabel: latest.label,
      latestTimeStr: latest.time
        ? new Date(latest.time).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          })
        : '--:--',
      statusText: status,
      workTime: msToHHMM(totalMs),
    };
  }, [rec]);

  const handleLocationClick = () => {
    if (locationLoading) return;
    checkLocation();
  };

  return (
    <Box className="grid grid-cols-2 gap-4 px-2">
      <Box className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4">
        <Text className="font-bold text-3xl">{latestTimeStr}</Text>
        <Text className="text-lg pt-1 text-gray-600">{latestLabel}</Text>
      </Box>

      <Box className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4">
        <Text className="font-bold text-3xl">{workTime}</Text>
        <Text className="text-lg pt-1 text-gray-600">Thời gian làm</Text>
      </Box>

      <Box className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4">
        <Text className={`font-bold text-3xl ${getStatusColor(statusText)}`}>{statusText}</Text>
        <Text className="text-lg pt-1 text-gray-600">Trạng thái</Text>
      </Box>

      <Box
        onClick={handleLocationClick}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4 cursor-pointer active:opacity-70"
      >
        <Text
          className="font-bold text-3xl"
          style={{ color: distance !== null && distance > MAX_DISTANCE ? 'red' : 'green' }}
        >
          {locationLoading ? '...' : distance !== null ? `${distance.toFixed(0)} m` : '--'}
        </Text>
        <Text className="text-lg pt-1 text-gray-600">Khoảng cách</Text>
        {locationError && (
          <Text size="xSmall" className="text-red-500 mt-1">
            {locationError}
          </Text>
        )}
      </Box>
    </Box>
  );
};

export default Statistical;
