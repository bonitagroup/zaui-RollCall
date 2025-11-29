import React, { useMemo } from 'react'; // 1. Import useMemo
import { Page, Box, Text, Avatar, Icon, Input } from 'zmp-ui';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import {
  selectedAttendanceUserState,
  validEmployeesSelector,
  attendanceUsersLoadingState,
  adminSearchTermState,
} from '@/states/state';

interface EmployeeSelectorProps {
  onBack: () => void;
}

const EmployeeSelector: React.FC<EmployeeSelectorProps> = ({ onBack }) => {
  const allEmployees = useRecoilValue(validEmployeesSelector);
  const loading = useRecoilValue(attendanceUsersLoadingState);
  const setSelectedUser = useSetRecoilState(selectedAttendanceUserState);

  const [searchTerm, setSearchTerm] = useRecoilState(adminSearchTermState);

  const filteredEmployees = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return allEmployees;

    return allEmployees.filter((u) => (u.name || '').toLowerCase().includes(term));
  }, [allEmployees, searchTerm]);

  return (
    <Page className="bg-[#F4F6F8] min-h-screen flex flex-col">
      <Box className="bg-gradient-to-br from-blue-600 to-cyan-500 px-4 py-4 pt-12 shadow-lg sticky top-0 z-50">
        <Box className="flex items-center space-x-3">
          <Box onClick={onBack} className="active:opacity-50 transition-opacity cursor-pointer">
            <Icon icon="zi-arrow-left" className="text-white text-2xl" />
          </Box>
          <Text className="text-white font-bold text-xl">Chọn nhân viên</Text>
        </Box>
      </Box>

      <Box className="p-4 mt-1 relative z-10 ">
        <Box className="bg-white rounded-xl shadow-md p-2">
          <Input.Search
            placeholder="Nhập tên nhân viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            clearable
            height={44}
          />
        </Box>
      </Box>

      <Box className="px-4 pb-4 flex-1 overflow-y-auto">
        <div className="flex justify-between items-end mb-3 px-1">
          <Text className="text-gray-500 font-medium text-sm">
            Danh sách ({filteredEmployees.length})
          </Text>
        </div>

        {loading ? (
          <Box className="flex justify-center py-10">
            <Box className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </Box>
        ) : (
          <Box className="space-y-3 pb-safe">
            {filteredEmployees.length === 0 ? (
              <Box className="text-center py-10 flex flex-col items-center">
                <Icon icon="zi-search" className="text-gray-300 text-4xl mb-2" />
                <Text className="text-gray-400">Không tìm thấy nhân viên nào</Text>
              </Box>
            ) : (
              filteredEmployees.map((u) => (
                <Box
                  key={u.zalo_id || Math.random()}
                  onClick={() => setSelectedUser(u)}
                  className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer hover:shadow-md"
                >
                  <Box className="flex items-center space-x-3 overflow-hidden">
                    <Avatar
                      src={u.avatar_url || ''}
                      className="border border-gray-100 shadow-sm shrink-0"
                    >
                      {u.name?.charAt(0)}
                    </Avatar>
                    <Box className="min-w-0">
                      <Text className="font-bold text-base text-gray-800 truncate">{u.name}</Text>
                      <Text className="text-gray-500 text-xs capitalize bg-gray-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                        {u.role || 'Nhân viên'}
                      </Text>
                    </Box>
                  </Box>
                  <Icon icon="zi-chevron-right" className="text-gray-300 text-sm shrink-0" />
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
