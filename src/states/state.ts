import { atom } from 'recoil';
import { User } from '@/types/users';
import { selector } from 'recoil';
import {
  getTodayDateString,
  config,
  isNowInRange,
  timeStringToDateToday,
  normalizeDate,
  checkSessionLeave,
} from '@/lib/utils';
import { AttendanceRecord, ShiftConfig } from '@/types/rollcalls';

export const adminTabState = atom({
  key: 'adminTabState',
  default: '',
});

export const userState = atom<User | null>({
  key: 'userState',
  default: null,
});

export const userLoadingState = atom<boolean>({
  key: 'userLoadingState',
  default: true,
});

export const attendanceRecordsState = atom<AttendanceRecord[]>({
  key: 'attendanceRecordsState',
  default: [],
});

export const attendanceLoadingState = atom<boolean>({
  key: 'attendanceLoadingState',
  default: true,
});

export const allUsersState = atom<User[]>({
  key: 'allUsersState',
  default: [],
});

export const adminSearchTermState = atom<string>({
  key: 'adminSearchTermState',
  default: '',
});

export const todayRecordSelector = selector<AttendanceRecord | undefined>({
  key: 'todayRecordSelector',
  get: ({ get }) => {
    const records = get(attendanceRecordsState);
    const todayKey = getTodayDateString();
    return records.find((r) => r.date === todayKey);
  },
});

export const historyRecordsSelector = selector<AttendanceRecord[]>({
  key: 'historyRecordsSelector',
  get: ({ get }) => {
    const records = get(attendanceRecordsState);
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },
});

export const currentShiftIndexSelector = selector<number | null>({
  key: 'currentShiftIndexSelector',
  get: () => {
    const now = new Date();
    for (let i = 0; i < config.shifts.length; i++) {
      const shift = config.shifts[i];
      if (
        now >= timeStringToDateToday(shift.checkInStart) &&
        now <= timeStringToDateToday(shift.checkOutEnd)
      ) {
        return i;
      }
    }
    return null;
  },
});

export const currentShiftSelector = selector<ShiftConfig | null>({
  key: 'currentShiftSelector',
  get: ({ get }) => {
    const idx = get(currentShiftIndexSelector);
    return idx !== null ? config.shifts[idx] : null;
  },
});

export const canCheckInNowSelector = selector<boolean>({
  key: 'canCheckInNowSelector',
  get: ({ get }) => {
    const shiftIdx = get(currentShiftIndexSelector);
    if (shiftIdx === null) return false;
    const shift = config.shifts[shiftIdx];
    return isNowInRange(shift.checkInStart, shift.checkInEnd);
  },
});

export const canCheckOutNowSelector = selector<boolean>({
  key: 'canCheckOutNowSelector',
  get: ({ get }) => {
    const shiftIdx = get(currentShiftIndexSelector);
    if (shiftIdx === null) return false;
    const shift = config.shifts[shiftIdx];
    return isNowInRange(shift.checkOutStart, shift.checkOutEnd);
  },
});

export const filteredUsersState = selector<User[]>({
  key: 'filteredUsersState',
  get: ({ get }) => {
    const allUsers = get(allUsersState);
    const searchTerm = get(adminSearchTermState).toLowerCase();

    if (!searchTerm) {
      return allUsers;
    }

    return allUsers.filter(
      (u) =>
        (u.name || '').toLowerCase().includes(searchTerm) || (u.zalo_id || '').includes(searchTerm)
    );
  },
});

export const splitUsersState = selector({
  key: 'splitUsersState',
  get: ({ get }) => {
    const filteredUsers = get(filteredUsersState);

    const assignedUsers = filteredUsers.filter((u) => u.role && u.role !== 'user');
    const unassignedUsers = filteredUsers.filter((u) => !u.role || u.role === 'user');

    return { assignedUsers, unassignedUsers };
  },
});

export const adminStatsState = selector({
  key: 'adminStatsState',
  get: ({ get }) => {
    const allUsers = get(allUsersState);

    const assignedCount = allUsers.filter((u) => u.role && u.role !== 'user').length;
    const unassignedCount = allUsers.filter((u) => !u.role || u.role === 'user').length;

    return { assignedCount, unassignedCount };
  },
});

export const selectedAttendanceUserState = atom<User | null>({
  key: 'selectedAttendanceUserState',
  default: null,
});

export const attendanceSheetVisibleState = atom<boolean>({
  key: 'attendanceSheetVisibleState',
  default: false,
});

export const attendanceUsersLoadingState = atom<boolean>({
  key: 'attendanceUsersLoadingState',
  default: false,
});

export const validEmployeesSelector = selector<User[]>({
  key: 'validEmployeesSelector',
  get: ({ get }) => {
    const allUsers = get(allUsersState);
    return allUsers.filter((u) => !!u.zalo_id && u.role && u.role !== 'user');
  },
});

export const calendarDateState = atom<Date>({
  key: 'calendarDateState',
  default: new Date(),
});

export const monthlyStatsState = atom<{ records: AttendanceRecord[]; leaves: any[] }>({
  key: 'monthlyStatsState',
  default: { records: [], leaves: [] },
});

export const calendarSummarySelector = selector({
  key: 'calendarSummarySelector',
  get: ({ get }) => {
    const currentDate = get(calendarDateState);
    const { records, leaves } = get(monthlyStatsState);

    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let worked = 0;
    let late = 0;
    let early = 0;
    let absent = 0;
    let leave = 0;

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getShiftTime = (shiftIdx: number, type: 'deadline' | 'outStart') => {
      const s = config.shifts[shiftIdx];
      return type === 'deadline' ? s.checkInDeadline : s.checkOutStart;
    };

    const compareTime = (
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

    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dateStr = normalizeDate(d);
      const isSunday = d.getDay() === 0;

      if (isSunday) continue;
      if (d.getTime() > today.getTime()) continue;

      const rec = records.find((r) => r.date === dateStr);

      const processSession = (
        shiftData: any,
        shiftIdx: number,
        sessionName: 'morning' | 'afternoon'
      ) => {
        const hasLeave = checkSessionLeave(dateStr, sessionName, leaves);
        if (hasLeave) {
          leave += 0.5;
          return;
        }

        if (shiftData && shiftData.checkIn && shiftData.checkOut) {
          worked += 0.5;

          if (compareTime(shiftData.checkIn, getShiftTime(shiftIdx, 'deadline'), '>')) {
            late++;
          }
          if (compareTime(shiftData.checkOut, getShiftTime(shiftIdx, 'outStart'), '<')) {
            early++;
          }
        } else {
          absent += 0.5;
        }
      };

      processSession(rec?.shifts?.morning, 0, 'morning');

      processSession(rec?.shifts?.afternoon, 1, 'afternoon');
    }

    return {
      worked,
      late,
      early,
      leave,
      absent,
      halfDays: 0,
      totalWorked: worked,
    };
  },
});

export const tasksState = atom<any[]>({
  key: 'tasksState',
  default: [],
});

export const taskGroupsSelector = selector({
  key: 'taskGroupsSelector',
  get: ({ get }) => {
    const tasks = get(tasksState);
    return {
      todo: tasks.filter((t) => ['pending', 'rework'].includes(t.status)),
      history: tasks.filter((t) => ['submitted', 'completed'].includes(t.status)),
    };
  },
});

export const taskStatsSelector = selector({
  key: 'taskStatsSelector',
  get: ({ get }) => {
    const tasks = get(tasksState);
    return {
      total: tasks.length,
      todo: tasks.filter((t) => ['pending', 'rework'].includes(t.status)).length,
      done: tasks.filter((t) => t.status === 'completed').length,
      rework: tasks.filter((t) => t.status === 'rework').length,
    };
  },
});

export const salaryListState = atom<any[]>({
  key: 'salaryListState',
  default: [],
});

export const totalSalaryPayoutSelector = selector({
  key: 'totalSalaryPayoutSelector',
  get: ({ get }) => {
    const list = get(salaryListState);
    return list.reduce((sum, item) => sum + (item.financials?.finalSalary || 0), 0);
  },
});

export const validSalaryListSelector = selector({
  key: 'validSalaryListSelector',
  get: ({ get }) => {
    const list = get(salaryListState);
    return list.filter((item) => item.user.role && item.user.role !== 'user');
  },
});
