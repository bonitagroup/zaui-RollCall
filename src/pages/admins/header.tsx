import React from 'react';
import { Box, Text, Input } from 'zmp-ui';
import { useRecoilState } from 'recoil';
import { adminSearchTermState } from '@/states/state';

export const AdminHeader: React.FC = () => {
  const [searchTerm, setSearchTerm] = useRecoilState(adminSearchTermState);

  return (
    <Box className="p-4 pt-10 bg-white shadow-sm sticky top-0 z-10">
      <Text.Title className="mb-4">Quản lý nhân sự</Text.Title>
      <Input.Search
        placeholder="Tìm theo tên ...."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </Box>
  );
};
