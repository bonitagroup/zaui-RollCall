import React from 'react';
import { Page, Box, Text, Icon, Button } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { useNavigate } from 'react-router-dom';
import { userState } from '@/states/state';
import CalendarView from '@/pages/admins/attendance/CalendarView';
import HistoryList from '@/pages/admins/attendance/HistoryList';

const MyAttendanceHistory: React.FC = () => {
  const navigate = useNavigate();

  const currentUser = useRecoilValue(userState);

  if (!currentUser || !currentUser.zalo_id) {
    return (
      <Page className="bg-gray-50 min-h-screen flex items-center justify-center">
        <Box className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </Page>
    );
  }

  return (
    <Page className="bg-gray-50 min-h-screen flex flex-col">
      <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-600 px-4 py-4 pt-12 shadow-md sticky top-0 z-50">
        <Box className="flex items-center justify-between">
          <Box className="flex items-center space-x-3">
            <Box
              onClick={() => navigate(-1)}
              className="active:opacity-50 transition-opacity cursor-pointer"
            >
              <Icon icon="zi-arrow-left" className="text-white text-2xl" />
            </Box>
            <Text className="text-white font-bold text-xl">Lịch sử chấm công</Text>
          </Box>
        </Box>
      </Box>

      <Box className="flex-1 overflow-y-auto">
        <Box className="mb-2">
          <CalendarView user={currentUser} />
        </Box>

        <HistoryList user={currentUser} />
      </Box>
    </Page>
  );
};

export default MyAttendanceHistory;
