import React, { VFC, useMemo } from 'react';
import { Box, Text } from 'zmp-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '@/states/state';

// Định nghĩa tabs cơ bản
const baseTabs = {
  '/': {
    label: 'Trang chủ',
    icon: '🏠',
  },
  '/attendance': {
    label: 'Chấm công',
    icon: '📅',
  },
  '/work': {
    label: 'Công việc',
    icon: '💼',
  },
  '/profile': {
    label: 'Cá nhân',
    icon: '👤',
  },
};

// Định nghĩa tab Admin
const adminTab = {
  '/admin': {
    label: 'Quản lý',
    icon: '🧑‍💼',
  },
};

const getActiveKey = (pathname: string) => {
  if (pathname.startsWith('/attendance')) return '/attendance';
  if (pathname.startsWith('/work')) return '/work';
  if (pathname.startsWith('/profile')) return '/profile';
  if (pathname.startsWith('/admin')) return '/admin';
  return '/';
};

export const Navigation: React.VFC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeKey = getActiveKey(location.pathname);

  const user = useRecoilValue(userState);

  // Tính toán các tabs để hiển thị
  const tabs = useMemo(() => {
    // Nếu là admin...
    if (user?.role === 'admin') {
      // --- ĐÂY LÀ ĐOẠN ĐÃ SỬA ---
      // 1. Dùng destructuring để "loại" tab /attendance ra
      // 2. 'removed' sẽ chứa tab /attendance, 'employeeTabs' sẽ chứa 3 tab còn lại
      const { '/attendance': removed, ...employeeTabs } = baseTabs;

      // 3. Trả về 3 tab còn lại VÀ tab admin mới
      return { ...employeeTabs, ...adminTab };
      // --- KẾT THÚC SỬA ---
    }

    // Mặc định trả về tabs cơ bản cho user thường
    return baseTabs;
  }, [user]); // Chỉ tính lại khi user thay đổi

  return (
    <Box flex className="w-full justify-around bg-white border-t border-gray-200 z-auto py-3">
      {Object.keys(tabs).map((path) => {
        const tab = tabs[path as keyof typeof tabs];

        return (
          <Box
            key={path}
            flex
            flexDirection="column"
            alignItems="center"
            className="flex-1"
            onClick={() => navigate(path)}
          >
            <Text className={`text-2xl ${activeKey === path ? 'text-blue-500' : 'text-gray-500'}`}>
              {tab.icon}
            </Text>
            <Text
              size="xxSmall"
              className={`font-medium ${activeKey === path ? 'text-blue-500' : 'text-gray-500'}`}
            >
              {tab.label}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
};
