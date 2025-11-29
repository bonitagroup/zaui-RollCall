import React from 'react';
import { Box, Text, Icon } from 'zmp-ui';

interface TaskDashboardProps {
  onNavigate: (screen: string, type?: string) => void;
}

const TaskDashboard: React.FC<TaskDashboardProps> = ({ onNavigate }) => {
  const menuItems = [
    {
      key: 'assign',
      title: 'Giao việc mới',
      desc: 'Chọn nhân viên để giao việc',
      icon: 'zi-plus-circle-solid',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      screen: 'assign',
    },
    {
      key: 'active',
      title: 'Quản lý tiến độ',
      desc: 'Việc đang làm & Chờ duyệt',
      icon: 'zi-list-1',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      screen: 'list',
      type: 'active',
    },
    {
      key: 'history',
      title: 'Lịch sử giao việc',
      desc: 'Các công việc đã hoàn thành',
      icon: 'zi-check-circle-solid',
      color: 'text-green-600',
      bg: 'bg-green-50',
      screen: 'list',
      type: 'history',
    },
    {
      key: 'stats',
      title: 'Thống kê',
      desc: 'Báo cáo hiệu suất (Sắp ra mắt)',
      icon: 'zi-poll-solid',
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      screen: 'stats',
    },
  ];

  return (
    <Box className="p-4 space-y-3">
      {menuItems.map((item) => (
        <Box
          key={item.key}
          onClick={() => onNavigate(item.screen, item.type)}
          className="bg-white p-4 rounded-xl shadow-sm flex items-center gap-4 active:opacity-70 transition-all border border-gray-100"
        >
          <Box className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}>
            <Icon icon={item.icon as any} className={`text-2xl ${item.color}`} />
          </Box>
          <Box className="flex-1">
            <Text className="font-bold text-lg text-gray-800">{item.title}</Text>
            <Text className="text-sm text-gray-500">{item.desc}</Text>
          </Box>
          <Icon icon="zi-chevron-right" className="text-gray-400" />
        </Box>
      ))}
    </Box>
  );
};

export default TaskDashboard;
