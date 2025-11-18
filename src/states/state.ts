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
