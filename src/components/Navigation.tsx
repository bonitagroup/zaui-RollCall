import React, { VFC, useMemo } from 'react';
import { Box, Text } from 'zmp-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '@/states/state';

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

const adminTab = {
  '/AdminDashboard': {
    label: 'Quản lý',
    icon: '🧑‍💼',
  },
};

const getActiveKey = (pathname: string) => {
  if (pathname.startsWith('/attendance')) return '/attendance';
  if (pathname.startsWith('/work')) return '/work';
  if (pathname.startsWith('/profile')) return '/profile';
  if (pathname.startsWith('/AdminDashboard')) return '/AdminDashboard';
  return '/';
};

export const Navigation: React.VFC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const activeKey = getActiveKey(location.pathname);

  const user = useRecoilValue(userState);

  const tabs = useMemo(() => {
    if (user?.role === 'admin') {
      const { '/attendance': removed, ...employeeTabs } = baseTabs;
      return { ...employeeTabs, ...adminTab };
    }

    return baseTabs;
  }, [user]);

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
