import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { calendarDateState, monthlyStatsState } from '@/states/state';
import api from '@/lib/api';
import { mapDbRecordToFrontend, recomputeState } from '@/lib/utils';
import { User } from '@/types/users';

export const useCalendarData = (user: User | null) => {
  const currentDate = useRecoilValue(calendarDateState);
  const setStats = useSetRecoilState(monthlyStatsState);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.zalo_id) return;

      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();

      try {
        const res: any = await api.get('/attendance/monthly-stats', {
          params: { zalo_id: user.zalo_id, month: currentMonth, year: currentYear },
        });

        if (res.success) {
          const standardizedRecords = (res.data.records || []).map((r: any) =>
            recomputeState(mapDbRecordToFrontend(r))
          );

          setStats({
            records: standardizedRecords,
            leaves: res.data.leaves || [],
          });
        }
      } catch (e) {
        console.error('Error fetching calendar stats:', e);
      }
    };

    fetchStats();
  }, [user?.zalo_id, currentDate, setStats]);
};
