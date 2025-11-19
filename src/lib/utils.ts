import { AttendanceRecord, ShiftConfig } from '@/types/rollcalls';

export const config = {
  shifts: [
    {
      name: 'Ca sáng',
      checkInStart: '07:45',
      checkInDeadline: '08:10',
      checkInEnd: '12:00',
      checkOutStart: '12:00',
      checkOutEnd: '12:30',
      minWorkMs: 4 * 60 * 60 * 1000,
    },
    {
      name: 'Ca chiều',
      checkInStart: '13:15',
      checkInDeadline: '13:35',
      checkInEnd: '18:00',
      checkOutStart: '17:30',
      checkOutEnd: '18:30',
      minWorkMs: 4 * 60 * 60 * 1000,
    },
  ],
};

export function timeStringToDateToday(time: string): Date {
  const [hh, mm] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(hh, mm, 0, 0);
  return d;
}

export function isNowInRange(start: string, end: string): boolean {
  const now = new Date();
  return now >= timeStringToDateToday(start) && now <= timeStringToDateToday(end);
}

export function msToHHMM(ms: number): string {
  if (isNaN(ms) || ms < 0) return '00:00';
  const totalMin = Math.floor(ms / 60000);
  const hh = Math.floor(totalMin / 60);
  const mm = totalMin % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}

export function formatDateDisplay(iso?: string): string {
  return iso ? new Date(iso).toLocaleDateString('vi-VN') : '--/--/----';
}

export function formatTimeDisplay(iso?: string): string {
  return iso
    ? new Date(iso).toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
    : '--:--';
}

export const getTodayDateString = (): string => {
  const d = new Date();
  return d.toLocaleString('sv', { timeZone: 'Asia/Ho_Chi_Minh' }).slice(0, 10);
};

export function toVNDateString(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    return d.toLocaleString('sv', { timeZone: 'Asia/Ho_Chi_Minh' }).slice(0, 10);
  } catch (e) {
    console.error('Failed to format date string:', dateInput);
    return '1970-01-01';
  }
}

export const recomputeState = (r: AttendanceRecord): AttendanceRecord => {
  const rec: AttendanceRecord = {
    ...r,
    shifts: {
      morning: { ...((r.shifts && r.shifts.morning) || { checkIn: null, checkOut: null }) },
      afternoon: { ...((r.shifts && r.shifts.afternoon) || { checkIn: null, checkOut: null }) },
    },
  };

  const getTime = (iso?: string | null) => (iso ? new Date(iso).getTime() : null);

  const morningIn = getTime(rec.shifts.morning.checkIn);
  const morningOut = getTime(rec.shifts.morning.checkOut);
  const afternoonIn = getTime(rec.shifts.afternoon.checkIn);
  const afternoonOut = getTime(rec.shifts.afternoon.checkOut);

  const morningWorked = morningIn && morningOut ? Math.max(0, morningOut - morningIn) : 0;
  const afternoonWorked = afternoonIn && afternoonOut ? Math.max(0, afternoonOut - afternoonIn) : 0;

  const totalWorked = morningWorked + afternoonWorked;
  rec.totalWorkedMs = totalWorked > 0 ? totalWorked : undefined;

  let isLate: boolean | undefined = undefined;
  if (morningIn) {
    const deadline = timeStringToDateToday(config.shifts[0].checkInDeadline).getTime();
    isLate = morningIn > deadline;
  }
  if (afternoonIn) {
    const deadline = timeStringToDateToday(config.shifts[1].checkInDeadline).getTime();
    isLate = (isLate ?? false) || afternoonIn > deadline;
  }
  rec.isLate = isLate;

  const allIns = [
    morningIn ? { t: morningIn, idx: 0 } : null,
    afternoonIn ? { t: afternoonIn, idx: 1 } : null,
  ].filter(Boolean) as { t: number; idx: number }[];
  const allOuts = [
    morningOut ? { t: morningOut, idx: 0 } : null,
    afternoonOut ? { t: afternoonOut, idx: 1 } : null,
  ].filter(Boolean) as { t: number; idx: number }[];

  if (allIns.length > 0) {
    const earliest = allIns.reduce((prev, cur) => (cur.t < prev.t ? cur : prev));
    rec.checkIn = new Date(earliest.t).toISOString();
    rec.checkInShiftIndex = earliest.idx;
  } else {
    rec.checkIn = undefined;
    rec.checkInShiftIndex = undefined;
  }

  if (allOuts.length > 0) {
    const latest = allOuts.reduce((prev, cur) => (cur.t > prev.t ? cur : prev));
    rec.checkOut = new Date(latest.t).toISOString();
    rec.checkOutShiftIndex = latest.idx;
  } else {
    rec.checkOut = undefined;
    rec.checkOutShiftIndex = undefined;
  }

  return rec;
};

export function mapDbRecordToFrontend(dbRecord: any): AttendanceRecord {
  const formattedDate = toVNDateString(dbRecord.date);

  return {
    date: formattedDate,
    shifts: {
      morning: {
        checkIn: dbRecord.check_in_morning ?? null,
        checkOut: dbRecord.check_out_morning ?? null,
      },
      afternoon: {
        checkIn: dbRecord.check_in_afternoon ?? null,
        checkOut: dbRecord.check_out_afternoon ?? null,
      },
    },
  };
}

export function getAttendanceStatus(rec?: AttendanceRecord): string {
  if (!rec || !rec.checkIn) {
    return '-';
  }

  const checkInTime = new Date(rec.checkIn);
  const checkInHour = checkInTime.getHours();
  const shiftIdx = rec.checkInShiftIndex ?? (checkInHour >= 13 ? 1 : 0);
  const shift = config.shifts[shiftIdx];

  let checkInStatus = '';
  if (rec.isLate) {
    const deadline = timeStringToDateToday(shift.checkInDeadline);
    const checkInDate = new Date(rec.checkIn);
    const lateMs = checkInDate.getTime() - deadline.getTime();
    const lateMinutes = Math.floor(lateMs / 60000);

    if (lateMinutes > 0) {
      checkInStatus = `Muộn ${lateMinutes} phút`;
    } else {
      checkInStatus = 'Đúng giờ';
    }
  } else {
    checkInStatus = 'Đúng giờ';
  }

  if (!rec.checkOut) {
    return checkInStatus;
  }

  const checkOutShiftIdx = rec.checkOutShiftIndex ?? 0;
  const checkOutShift = config.shifts[checkOutShiftIdx];

  const checkOutTime = new Date(rec.checkOut).getTime();
  const shiftCheckOutStart = timeStringToDateToday(checkOutShift.checkOutStart).getTime();
  const isLeavingEarly = checkOutTime < shiftCheckOutStart;

  let checkOutStatus = '';
  if (isLeavingEarly) {
    checkOutStatus = 'Về sớm';
  } else {
    checkOutStatus = 'Đúng giờ';
  }

  if (checkInStatus === 'Đúng giờ' && checkOutStatus === 'Đúng giờ') {
    return 'Đúng giờ';
  }

  return `${checkInStatus}, ${checkOutStatus}`;
}

export function getShiftName(rec?: AttendanceRecord): string {
  if (!rec || rec.checkInShiftIndex === undefined) return '-';
  return config.shifts[rec.checkInShiftIndex].name;
}
