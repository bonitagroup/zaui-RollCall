import React from 'react';
import { Box, Text, Avatar, Button } from 'zmp-ui';
import { User } from '@/types/users';

interface AssignScreenProps {
  employees: User[];
  onSelectUser: (userId: string) => void;
  onOpenCreateModal: (userId: string) => void;
}

const AssignScreen: React.FC<AssignScreenProps> = ({
  employees,
  onSelectUser,
  onOpenCreateModal,
}) => {
  if (employees.length === 0) {
    return <Box className="p-4 text-center text-gray-400">Chưa có nhân viên nào</Box>;
  }

  return (
    <Box className="p-4 space-y-3 pb-20">
      <Text className="font-bold text-lg mb-2 text-gray-800">Danh sách nhân viên</Text>
      {employees.map((u) => {
        const isBusy = false;

        return (
          <Box
            key={u.zalo_id}
            className="bg-white p-3 rounded-xl shadow-sm flex items-center justify-between border border-gray-100"
          >
            <Box className="flex items-center gap-3">
              <Box className="relative">
                <Avatar src={u.avatar_url || ''} />
                <Box
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    isBusy ? 'bg-red-500' : 'bg-green-500'
                  }`}
                />
              </Box>
              <Box>
                <Text className="font-bold text-base">{u.name}</Text>
                <Text size="xSmall" className="text-gray-500 capitalize">
                  {u.role || 'Nhân viên'}
                </Text>
              </Box>
            </Box>
            <Box className="flex gap-2">
              <Button
                size="small"
                variant="tertiary"
                onClick={() => u.zalo_id && onSelectUser(u.zalo_id)}
              >
                Xem việc
              </Button>
              <Button
                size="small"
                className="bg-blue-600"
                onClick={() => u.zalo_id && onOpenCreateModal(u.zalo_id)}
              >
                +
              </Button>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default AssignScreen;
