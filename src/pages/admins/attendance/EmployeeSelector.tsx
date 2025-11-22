import React from 'react';
import { Page, Box, Text, Avatar, Icon } from 'zmp-ui';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import {
  selectedAttendanceUserState,
  validEmployeesSelector,
  attendanceUsersLoadingState,
} from '@/states/state';

interface EmployeeSelectorProps {
  onBack: () => void;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({ onBack }) => {
  const employees = useRecoilValue(validEmployeesSelector);
  const loading = useRecoilValue(attendanceUsersLoadingState);
  const setSelectedUser = useSetRecoilState(selectedAttendanceUserState);

  return (
    <Page className="bg-gray-50 min-h-screen flex flex-col">
      <Box className="bg-gradient-to-r from-blue-600 to-purple-700 px-4 py-4 pt-12 shadow-md sticky top-0 z-50">
        <Box className="flex items-center space-x-3">
          <Box onClick={onBack} className="active:opacity-50 transition-opacity cursor-pointer">
            <Icon icon="zi-arrow-left" className="text-white text-2xl" />
          </Box>
          <Text className="text-white font-bold text-xl">Quản lý ngày công</Text>
        </Box>
      </Box>

      <Box className="p-4 flex-1">
        <Text className="mb-4 text-gray-500 font-medium">
          Danh sách nhân viên ({employees.length})
        </Text>

        {loading ? (
          <Box className="flex justify-center py-10">
            <Box className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </Box>
        ) : (
          <Box className="space-y-3">
            {employees.length === 0 ? (
              <Box className="text-center py-10 text-gray-400">Chưa có nhân viên nào</Box>
            ) : (
              employees.map((u) => (
                <Box
                  key={u.zalo_id || Math.random()}
                  onClick={() => setSelectedUser(u)}
                  className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between active:bg-gray-50 transition-all cursor-pointer"
                >
                  <Box className="flex items-center space-x-3">
                    <Avatar src={u.avatar_url || ''}>{u.name?.charAt(0)}</Avatar>
                    <Box>
                      <Text className="font-bold text-base">{u.name}</Text>
                      <Text className="text-gray-500 text-sm capitalize">
                        {u.role || 'Nhân viên'}
                      </Text>
                    </Box>
                  </Box>
                  <Box className="bg-blue-50 px-3 py-1 rounded-full">
                    <Text className="text-blue-600 text-xs font-bold">Xem</Text>
                  </Box>
                </Box>
              ))
            )}
          </Box>
        )}
      </Box>
    </Page>
  );
};

export default EmployeeSelector;
