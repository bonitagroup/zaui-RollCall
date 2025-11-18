import { useEffect, useCallback } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  userState,
  userLoadingState,
  attendanceRecordsState,
  attendanceLoadingState,
} from '@/states/state';
import api from '@/lib/api';
import { mapDbRecordToFrontend, recomputeState } from '@/lib/utils';

const useFetchHistory = (setRecords: any) => {
  return useCallback(
    async (zaloId: string) => {
      try {
        const payload: any = await api.get('/attendance/history', {
          params: { zalo_id: zaloId },
        });

        if (payload && payload.success && Array.isArray(payload.data)) {
          const frontendRecords = payload.data.map(mapDbRecordToFrontend).map(recomputeState);
          setRecords(frontendRecords);
        } else {
          setRecords([]);
        }
      } catch (e: any) {
        setRecords([]);
      }
    },
    [setRecords]
  );
};

export const useAttendanceInit = () => {
  const user = useRecoilValue(userState);
  const userLoading = useRecoilValue(userLoadingState);
  const setRecords = useSetRecoilState(attendanceRecordsState);
  const setLoading = useSetRecoilState(attendanceLoadingState);

  const fetchHistory = useFetchHistory(setRecords);

  useEffect(() => {
    if (userLoading) {
      setLoading(true);
      return;
    }

    if (!user || !user.zalo_id) {
      setRecords([]);
      setLoading(false);
      return;
    }

    const zaloId = user.zalo_id;

    const runFetch = async () => {
      setLoading(true);
      try {
        await fetchHistory(zaloId);
      } catch (e) {
      } finally {
        setLoading(false);
      }
    };

    runFetch();
  }, [user, userLoading, fetchHistory, setRecords, setLoading]);
};
