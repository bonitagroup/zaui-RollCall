import React from 'react';
import { Box, Text } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { adminStatsState } from '@/states/state';

export const AdminStats: React.FC = () => {
  const { assignedCount, unassignedCount } = useRecoilValue(adminStatsState);

  return (
    <Box className="grid grid-cols-2 gap-4 px-4">
      <Box className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4">
        <Text className="font-bold text-3xl text-blue-600">{assignedCount}</Text>
        <Text className="text-lg pt-1 text-gray-600">Đã có chức vụ</Text>
      </Box>
      <Box className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4">
        <Text className="font-bold text-3xl text-gray-500">{unassignedCount}</Text>
        <Text className="text-lg pt-1 text-gray-600">Chưa có chức vụ</Text>
      </Box>
    </Box>
  );
};
