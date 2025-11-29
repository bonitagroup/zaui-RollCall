import React, { useEffect } from 'react'; // Thêm useEffect
import { Page, Box, Text } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { userState } from '@/states/state';
import { useSearchParams, useNavigate } from 'react-router-dom'; // Import 2 hook này

import PersonnelManagement from './management';
import AttendanceManagement from './attendance/index';
import SalaryManagement from './salary/SalaryManagement';
import LeaveManagement from './leaves/index';
import TaskManagement from './task/TaskManagement';

const AdminDashboard = () => {
  const admin = useRecoilValue(userState);

  // Thay thế recoil activeTab bằng searchParams
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Lấy activeTab hiện tại từ URL (ví dụ: ?tab=salary)
  const activeTab = searchParams.get('tab') || '';

  // Hàm chuyển tab: Đẩy vào lịch sử duyệt web
  const handleSwitchTab = (key) => {
    setSearchParams({ tab: key });
  };

  // Hàm quay lại menu: Thay vì set state, ta dùng navigate(-1) để lùi lịch sử
  // Điều này giúp đồng bộ với nút Back vật lý
  const handleBackToMenu = () => {
    navigate(-1);
  };

  if (!admin || admin.role !== 'admin') {
    return (
      <Page>
        <Box className="p-4 flex items-center justify-center min-h-60">
          <Text className="text-red-500 font-bold text-lg">Bạn không có quyền truy cập.</Text>
        </Box>
      </Page>
    );
  }

  const menuItems = [
    {
      key: 'personnel',
      label: 'Quản lý nhân sự',
      icon: '👥',
      description: 'Quản lý thông tin nhân viên và phân quyền',
    },
    {
      key: 'job',
      label: 'Quản lý công việc',
      icon: '💼',
      description: 'Giao việc và theo dõi tiến độ',
    },
    {
      key: 'attendance',
      label: 'Quản lý ngày công',
      icon: '📊',
      description: 'Quản lý chấm công và ngày công',
    },
    {
      key: 'salary',
      label: 'Quản lý lương',
      icon: '💰',
      description: 'Theo dõi và tính toán lương nhân viên',
    },
    {
      key: 'leave',
      label: 'Quản lý đơn xin nghỉ',
      icon: '📝',
      description: 'Duyệt đơn xin nghỉ phép của nhân viên',
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'personnel':
        return <PersonnelManagement onBack={handleBackToMenu} />;
      case 'job':
        return <TaskManagement onBack={handleBackToMenu} />;
      case 'attendance':
        return <AttendanceManagement onBack={handleBackToMenu} />;
      case 'salary':
        return <SalaryManagement onBack={handleBackToMenu} />;
      case 'leave':
        return <LeaveManagement onBack={handleBackToMenu} />;
      default:
        // Mặc định hiển thị Menu
        return (
          <Box className="p-4 pb-20">
            <Box className="space-y-3">
              {menuItems.map((item) => (
                <Box
                  key={item.key}
                  // SỬ DỤNG HÀM CHUYỂN TAB MỚI
                  onClick={() => handleSwitchTab(item.key)}
                  className="flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-all duration-200 hover:shadow-md"
                >
                  <Box className="flex items-center space-x-4 flex-1">
                    <Box className="w-12 h-12 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl flex items-center justify-center">
                      <Text className="text-xl">{item.icon}</Text>
                    </Box>
                    <Box className="flex-1">
                      <Text className="font-semibold text-gray-800 text-lg">{item.label}</Text>
                      <Text className="text-gray-500 text-sm mt-1">{item.description}</Text>
                    </Box>
                  </Box>
                  <Box className="flex items-center">
                    <Text className="text-gray-400 text-3xl font-bold">›</Text>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box className="text-center mt-8 mb-12">
              <Box className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Text className="text-4xl">👋</Text>
              </Box>
              <Text className="text-gray-600 text-lg font-bold mb-2">Chào mừng trở lại!</Text>
              <Text className="text-gray-400 text-sm">{admin.name || 'Quản trị viên'}</Text>
            </Box>
          </Box>
        );
    }
  };

  return (
    <Page className="flex flex-col min-h-screen bg-gray-50 ">
      {/* Chỉ hiện Header khi ở trang Menu (activeTab rỗng) */}
      {!activeTab && (
        <Box className="bg-gray-100 shadow-sm py-6 px-4">
          <Box className="flex items-center justify-start pt-8">
            <Box className="flex items-center space-x-2">
              <img
                src={admin.avatar_url || 'https://placehold.co/40x40/EFEFEF/AAAAAA?text=AD'}
                className="w-12 h-12 rounded-full border-2 border-blue-100"
                alt="Admin"
              />
            </Box>
            <Box className="pl-4">
              <Text className="text-2xl font-bold text-gray-800">Hệ thống Admin</Text>
              <Text className="text-gray-500 text-sm mt-1">Quản lý toàn bộ hệ thống nhân sự</Text>
            </Box>
          </Box>
        </Box>
      )}

      <Box className="flex-1">{renderContent()}</Box>
    </Page>
  );
};

export default AdminDashboard;
