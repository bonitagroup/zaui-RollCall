import React from 'react';
import { Box, Text, Icon, Page } from 'zmp-ui';

interface LeaveManagementProps {
  onBack: () => void;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ onBack }) => {
  return (
    <Page className="bg-gray-50 min-h-screen flex flex-col">
      <Box className="bg-gradient-to-r from-red-500 to-pink-600 px-4 py-4 pt-12 shadow-md sticky top-0 z-50">
        <Box className="flex items-center space-x-3">
          <Box onClick={onBack} className="active:opacity-50 transition-opacity">
            <Icon icon="zi-arrow-left" className="text-white text-2xl" />
          </Box>
          <Text className="text-white font-bold text-xl">Quản lý xin nghỉ</Text>
        </Box>
      </Box>

      <Box className="flex-1 flex items-center justify-center p-6">
        <Box className="text-center w-full">
          <Box className="w-24 h-24 bg-gradient-to-br from-red-50 to-red-100 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm animate-bounce">
            <Text className="text-4xl">📝</Text>
          </Box>
          <Text className="text-gray-800 text-xl font-bold mb-2">Tính năng đang phát triển</Text>
          <Text size="small" className="text-gray-500 px-8">
            Hệ thống quản lý đơn từ và phê duyệt nghỉ phép sẽ sớm ra mắt trong phiên bản tới.
          </Text>
        </Box>
      </Box>
    </Page>
  );
};

export default LeaveManagement;
