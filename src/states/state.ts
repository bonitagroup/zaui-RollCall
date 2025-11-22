import { atom } from 'recoil';
import { User } from '@/types/users';
import { selector } from 'recoil';
import { getTodayDateString, config, isNowInRange, timeStringToDateToday } from '@/lib/utils';
import { AttendanceRecord, ShiftConfig } from '@/types/rollcalls';

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

//---ADMIN--------------------------------

// Lọc danh sách user dựa trên searchTerm
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

// Tách danh sách đã lọc thành 2 nhóm
export const splitUsersState = selector({
  key: 'splitUsersState',
  get: ({ get }) => {
    const filteredUsers = get(filteredUsersState);

    const assignedUsers = filteredUsers.filter((u) => u.role && u.role !== 'user');
    const unassignedUsers = filteredUsers.filter((u) => !u.role || u.role === 'user');

    return { assignedUsers, unassignedUsers };
  },
});

// Tính toán số liệu cho AdminStats
export const adminStatsState = selector({
  key: 'adminStatsState',
  get: ({ get }) => {
    const allUsers = get(allUsersState);

    const assignedCount = allUsers.filter((u) => u.role && u.role !== 'user').length;
    const unassignedCount = allUsers.filter((u) => !u.role || u.role === 'user').length;

    return { assignedCount, unassignedCount };
  },
});

// Nhân viên đang được chọn để xem lịch sử
export const selectedAttendanceUserState = atom<User | null>({
  key: 'selectedAttendanceUserState',
  default: null,
});

// Trạng thái hiển thị Sheet chọn nhân viên
export const attendanceSheetVisibleState = atom<boolean>({
  key: 'attendanceSheetVisibleState',
  default: false,
});

// Trạng thái đang tải danh sách nhân viên
export const attendanceUsersLoadingState = atom<boolean>({
  key: 'attendanceUsersLoadingState',
  default: false,
});

// Selector lọc danh sách nhân viên đã có chức vụ
export const validEmployeesSelector = selector<User[]>({
  key: 'validEmployeesSelector',
  get: ({ get }) => {
    const allUsers = get(allUsersState);
    return allUsers.filter((u) => !!u.zalo_id && u.role && u.role !== 'user');
  },
});

// Atom lưu ngày hiện tại đang xem trên lịch
export const calendarDateState = atom<Date>({
  key: 'calendarDateState',
  default: new Date(),
});

// Atom lưu dữ liệu thô từ API (Records + Leaves)
export const monthlyStatsState = atom<{ records: AttendanceRecord[]; leaves: any[] }>({
  key: 'monthlyStatsState',
  default: { records: [], leaves: [] },
});

// Selector tính toán Summary
export const calendarSummarySelector = selector({
  key: 'calendarSummarySelector',
  get: ({ get }) => {
    const currentDate = get(calendarDateState);
    const stats = get(monthlyStatsState);

    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();

    let worked = 0;
    let late = 0;
    let early = 0;
    let absent = 0;
    let leave = 0;
    let halfDays = 0;

    const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
    const endOfMonth = new Date(currentYear, currentMonth, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const getShiftTime = (shiftIdx: number, type: 'deadline' | 'outStart') => {
      const s = config.shifts[shiftIdx];
      if (type === 'deadline') return s.checkInDeadline;
      return s.checkOutStart;
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

    const getSafeDateStr = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    for (let d = new Date(startOfMonth); d <= endOfMonth; d.setDate(d.getDate() + 1)) {
      const dateStr = getSafeDateStr(d);
      const isSunday = d.getDay() === 0;
      if (isSunday) continue;
      if (d.getTime() >= today.getTime()) {
        continue;
      }

      const rec = stats.records.find((r) => r.date === dateStr);
      const leaveReq = stats.leaves.find(
        (l: any) => new Date(l.start_date) <= d && new Date(l.end_date) >= d
      );

      if (leaveReq) {
        leave++;
        continue;
      }

      if (d > today) {
        continue;
      }

      if (!rec) {
        absent++;
        continue;
      }

      const am = rec.shifts.morning;
      const pm = rec.shifts.afternoon;

      const checkShiftErrors = (shift: any, idx: number) => {
        if (!shift.checkIn || !shift.checkOut) return;

        const isLate = compareTime(shift.checkIn, getShiftTime(idx, 'deadline'), '>');
        const isEarly = compareTime(shift.checkOut, getShiftTime(idx, 'outStart'), '<');

        if (isLate) late++;
        if (isEarly) early++;
      };

      checkShiftErrors(am, 0);
      checkShiftErrors(pm, 1);

      const hasMorning = !!(am.checkIn && am.checkOut);
      const hasAfternoon = !!(pm.checkIn && pm.checkOut);

      const hasMorningHalf = am.checkIn && !am.checkOut;
      const hasAfternoonHalf = pm.checkIn && !pm.checkOut;

      let dayWorked = 0;

      if (hasMorning) dayWorked += 0.5;
      else if (hasMorningHalf) dayWorked += 0.5;

      if (hasAfternoon) dayWorked += 0.5;
      else if (hasAfternoonHalf) dayWorked += 0.5;

      if (dayWorked === 1) worked++;
      else if (dayWorked === 0.5) halfDays += 0.5;
      else absent++;
    }

    return { worked, late, early, leave, absent, halfDays, totalWorked: worked + halfDays };
  },
});
