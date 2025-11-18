import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState, attendanceRecordsState } from '@/states/state';
import { currentShiftIndexSelector } from '@/states/state';
import api from '@/lib/api';
import { recomputeState, mapDbRecordToFrontend } from '@/lib/utils';
import { ActionResult, AttendanceRecord } from '@/types/rollcalls';

export const useAttendanceActions = () => {
  const user = useRecoilValue(userState);
  const currentShiftIdx = useRecoilValue(currentShiftIndexSelector);
  const setRecords = useSetRecoilState(attendanceRecordsState);

  const updateRecords = (updatedRecord: AttendanceRecord) => {
    setRecords((prev) => {
      const others = prev.filter((r) => r.date !== updatedRecord.date);
      return [...others, updatedRecord];
    });
  };

  const checkIn = async (): Promise<ActionResult> => {
    if (!user) return { ok: false };
    if (currentShiftIdx === null) return { ok: false };

    const shiftKey = currentShiftIdx === 0 ? 'morning' : 'afternoon';

    try {
      const res: any = await api.post('/attendance/check-in', {
        zalo_id: user.zalo_id,
        shiftKey: shiftKey,
      });

      if (res.success && res.data) {
        const updatedRecord = recomputeState(mapDbRecordToFrontend(res.data));
        updateRecords(updatedRecord);
        return { ok: true };
      }
      return { ok: false };
    } catch (e: any) {
      console.error('API Check-in error', e);
      return { ok: false };
    }
  };

  const checkOut = async (): Promise<ActionResult> => {
    if (!user) return { ok: false };
    if (currentShiftIdx === null) return { ok: false };

    const shiftKey = currentShiftIdx === 0 ? 'morning' : 'afternoon';

    try {
      const res: any = await api.post('/attendance/check-out', {
        zalo_id: user.zalo_id,
        shiftKey: shiftKey,
      });

      if (res.success && res.data) {
        const updatedRecord = recomputeState(mapDbRecordToFrontend(res.data));
        updateRecords(updatedRecord);
        return { ok: true };
      }
      return { ok: false };
    } catch (e: any) {
      console.error('API Check-out error', e);
      return { ok: false };
    }
  };

  return { checkIn, checkOut };
};
