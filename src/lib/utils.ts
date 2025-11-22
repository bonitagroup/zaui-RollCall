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

export function formatDateDisplay(dateStr?: string): string {
  if (!dateStr) return '--/--/----';
  if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [y, m, d] = dateStr.split('-');
    return `${d}/${m}/${y}`;
  }
  return new Date(dateStr).toLocaleDateString('vi-VN');
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

export function normalizeDate(dateInput: string | Date): string {
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '1970-01-01';

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (e) {
    console.error('Failed to normalize date:', dateInput);
    return '1970-01-01';
  }
}

export const getTodayDateString = (): string => {
  return normalizeDate(new Date());
};

export function toVNDateString(dateInput: string | Date): string {
  return normalizeDate(dateInput);
}

export const recomputeState = (r: AttendanceRecord): AttendanceRecord => {
  const rec: AttendanceRecord = {
    ...r,
    shifts: {
      morning: { ...((r.shifts && r.shifts.morning) || { checkIn: null, checkOut: null }) },
      afternoon: { ...((r.shifts && r.shifts.afternoon) || { checkIn: null, checkOut: null }) },
    },
  };
  return rec;
};

export function mapDbRecordToFrontend(dbRecord: any): AttendanceRecord {
  const formattedDate = normalizeDate(dbRecord.date);
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
  if (!rec) return '-';
  return '-';
}

export function getShiftName(rec?: AttendanceRecord): string {
  if (!rec || rec.checkInShiftIndex === undefined) return '-';
  return config.shifts[rec.checkInShiftIndex].name;
}

export const formatDuration = (ms: number) => {
  const safeMs = Math.max(0, ms);
  const s = Math.floor((safeMs / 1000) % 60)
    .toString()
    .padStart(2, '0');
  const m = Math.floor((safeMs / 60000) % 60)
    .toString()
    .padStart(2, '0');
  const h = Math.floor(safeMs / 3600000)
    .toString()
    .padStart(2, '0');
  return `${h}:${m}:${s}`;
};

export const getShiftConfigTime = (shiftIdx: number, type: 'deadline' | 'outStart') => {
  const s = config.shifts[shiftIdx];
  if (type === 'deadline') return s.checkInDeadline;
  return s.checkOutStart;
};

export const compareTime = (
  iso: string | null | undefined,
  targetTimeStr: string,
  mode: '>' | '<'
) => {
  if (!iso) return false;
  const d = new Date(iso);
  const [h, m] = targetTimeStr.split(':').map(Number);
  const timeVal = d.getHours() * 60 + d.getMinutes();
  const targetVal = h * 60 + m;
  return mode === '>' ? timeVal > targetVal : timeVal < targetVal;
};

export const calculateShiftStatus = (
  checkIn: string | null,
  checkOut: string | null,
  shiftIdx: number
) => {
  if (!checkIn || (checkIn && !checkOut)) {
    return { text: 'Vắng mặt', color: 'text-red-600' };
  }

  const errors: string[] = [];

  if (checkIn && compareTime(checkIn, getShiftConfigTime(shiftIdx, 'deadline'), '>')) {
    const d = new Date(checkIn);
    const [h, m] = getShiftConfigTime(shiftIdx, 'deadline').split(':').map(Number);
    const diff = d.getHours() * 60 + d.getMinutes() - (h * 60 + m);
    errors.push(`Muộn ${diff}p`);
  }

  if (checkOut && compareTime(checkOut, getShiftConfigTime(shiftIdx, 'outStart'), '<')) {
    const d = new Date(checkOut);
    const [h, m] = getShiftConfigTime(shiftIdx, 'outStart').split(':').map(Number);
    const diff = h * 60 + m - (d.getHours() * 60 + d.getMinutes());
    errors.push(`Sớm ${diff}p`);
  }

  if (errors.length > 0) {
    if (errors.length > 1) return { text: errors.join(' & '), color: 'text-gray-600' };
    return { text: errors[0], color: 'text-orange-600' };
  }

  return { text: 'Đúng giờ', color: 'text-green-600' };
};
