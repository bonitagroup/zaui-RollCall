import React, { useEffect } from 'react';
import { Page, Box, Sheet, Avatar, Text, Icon } from 'zmp-ui';
import { useRecoilValue, useSetRecoilState, useRecoilState } from 'recoil';
import {
  allUsersState,
  userState,
  selectedAttendanceUserState,
  attendanceSheetVisibleState,
  attendanceUsersLoadingState,
  validEmployeesSelector,
} from '@/states/state';
import api from '@/lib/api';
import EmployeeSelector from './EmployeeSelector';
import CalendarView from './CalendarView';
import HistoryList from './HistoryList';

const AttendanceManagement = ({ onBack }: { onBack: () => void }) => {
  const admin = useRecoilValue(userState);
  const allUsers = useRecoilValue(allUsersState);
  const setAllUsers = useSetRecoilState(allUsersState);

  const [selectedUser, setSelectedUser] = useRecoilState(selectedAttendanceUserState);
  const [sheetVisible, setSheetVisible] = useRecoilState(attendanceSheetVisibleState);
  const setLoadingUsers = useSetRecoilState(attendanceUsersLoadingState);

  const employees = useRecoilValue(validEmployeesSelector);

  // Logic tự động tải danh sách user
  useEffect(() => {
    const fetchUsersIfNeeded = async () => {
      if (allUsers.length === 0 && admin?.zalo_id) {
        setLoadingUsers(true);
        try {
          const res: any = await api.get('/admin/users', {
            params: { admin_zalo_id: admin.zalo_id },
          });
          if (res.success && Array.isArray(res.data)) {
            setAllUsers(res.data);
          }
        } catch (e) {
          console.error('Failed to fetch users', e);
        } finally {
          setLoadingUsers(false);
        }
      }
    };
    fetchUsersIfNeeded();
  }, [allUsers.length, admin?.zalo_id, setAllUsers, setLoadingUsers]);

  // Nếu chưa chọn nhân viên, hiển thị màn hình chọn
  if (!selectedUser) {
    return <EmployeeSelector onBack={onBack} />;
  }

  return (
    <Page className="bg-gray-50 min-h-screen flex flex-col">
      <Box className="bg-gradient-to-r from-blue-600 to-purple-700 px-4 pb-4 pt-12 shadow-lg relative overflow-hidden">
        <Box className="flex items-center pb-6 border-b border-white/20 mb-4">
          <Box onClick={() => setSelectedUser(null)}>
            <Icon icon="zi-arrow-left" className="text-white text-2xl mr-2" />
          </Box>
          <Text className="text-white font-bold text-xl ml-1.5">Quản lý ngày công</Text>
        </Box>

        <Box className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full transform translate-x-10 -translate-y-10" />
        <Box className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full transform -translate-x-5 translate-y-5" />

        {/* User Info */}
        <Box className="flex items-center space-x-4 relative z-10">
          <Avatar
            src={selectedUser.avatar_url || ''}
            size={52}
            className="border-2 border-white/50 shadow-md"
          />
          <Box className="flex-1">
            <Text className="text-white font-bold text-xl leading-tight">{selectedUser.name}</Text>
            <Text className="text-blue-100 text-sm opacity-90">
              {selectedUser.role || 'Thành viên'}
            </Text>
          </Box>

          <Box
            onClick={() => setSheetVisible(true)}
            className="bg-white/20 backdrop-blur-md h-10 w-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-white/30 transition-colors shadow-sm border border-white/10"
          >
            <Icon icon="zi-chevron-down" className="text-white font-bold" />
          </Box>
        </Box>
      </Box>

      {/* Body Content */}
      <Box className="flex-1 overflow-auto">
        <CalendarView user={selectedUser} />
        <HistoryList user={selectedUser} />
      </Box>

      {/* Sheet chọn nhân viên */}
      <Sheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        autoHeight
        mask
        handler
        swipeToClose
      >
        <Box className="p-4 pb-8">
          <Text className="font-bold text-xl mb-5 text-center text-gray-800">Chọn nhân viên</Text>
          <Box className="max-h-[60vh] overflow-y-auto space-y-2">
            {employees.map((u) => (
              <Box
                key={u.zalo_id}
                onClick={() => {
                  setSelectedUser(u);
                  setSheetVisible(false);
                }}
                className={`p-3 rounded-xl flex items-center space-x-3 transition-all cursor-pointer ${
                  selectedUser.zalo_id === u.zalo_id
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : 'bg-white border border-gray-100 hover:bg-gray-50'
                }`}
              >
                <Avatar
                  src={u.avatar_url || ''}
                  size={40}
                  className={
                    selectedUser.zalo_id === u.zalo_id ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                  }
                />
                <Box className="flex-1">
                  <Text
                    className={`font-semibold text-base ${
                      selectedUser.zalo_id === u.zalo_id ? 'text-blue-700' : 'text-gray-700'
                    }`}
                  >
                    {u.name}
                  </Text>
                  <Text className="text-gray-500 text-sm capitalize">{u.role}</Text>
                </Box>
                {selectedUser.zalo_id === u.zalo_id && (
                  <Icon icon="zi-check" className="text-blue-600 text-xl" />
                )}
              </Box>
            ))}
          </Box>
        </Box>
      </Sheet>
    </Page>
  );
};

export default AttendanceManagement;
