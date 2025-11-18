export interface ShiftConfig {
  name: string;
  checkInStart: string;
  checkInDeadline: string;
  checkInEnd: string;
  checkOutStart: string;
  checkOutEnd: string;
  minWorkMs: number;
}

export interface AttendanceRecord {
  date: string;
  checkIn?: string;
  checkOut?: string;
  checkInShiftIndex?: number;
  checkOutShiftIndex?: number;
  totalWorkedMs?: number;
  isLate?: boolean;
  shifts: {
    morning: ShiftRecord;
    afternoon: ShiftRecord;
  };
}

export interface ShiftRecord {
  checkIn: string | null;
  checkOut: string | null;
  status?: string;
}

export type ActionResult = { ok: boolean; message?: string };

export interface AttendanceContextValue {
  records: AttendanceRecord[];
  todayRecord: () => AttendanceRecord | undefined;
  checkIn: () => Promise<ActionResult>;
  checkOut: () => Promise<ActionResult>;
  getCurrentShift: () => ShiftConfig | null;
  canCheckInNow: () => boolean;
  canCheckOutNow: () => boolean;
  getCurrentShiftIndex: () => number | null;
  helpers: {
    msToHHMM: (ms: number) => string;
    getHistoryRecords: () => AttendanceRecord[];
    formatDateDisplay: (iso?: string) => string;
    formatTimeDisplay: (iso?: string) => string;
    getAttendanceStatus: (rec?: AttendanceRecord) => string;
    getShiftName: (rec?: AttendanceRecord) => string;
  };
}
