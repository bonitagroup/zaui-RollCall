import React, { useState } from 'react';
import { Box, Text, Select, Button } from 'zmp-ui';
import { User } from '@/types/users';
import { useSetRecoilState } from 'recoil';
import { allUsersState } from '@/states/state';

const API_URL = import.meta.env.VITE_API_URL || '';

const updateRoleOnBackend = async (zalo_id: string, role: string): Promise<User | null> => {
  try {
    const res = await fetch(`${API_URL}/api/user/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zalo_id, role }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (e) {
    return null;
  }
};

interface UserRowProps {
  user: User;
  roles: string[];
}

export const UserRow: React.FC<UserRowProps> = ({ user, roles }) => {
  const setAllUsers = useSetRecoilState(allUsersState);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role ?? 'user');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!user.zalo_id) {
      alert('Lỗi: Người dùng này không có Zalo ID.');
      return;
    }
    setIsSaving(true);
    const updatedUser = await updateRoleOnBackend(user.zalo_id, selectedRole);
    if (updatedUser) {
      setAllUsers((prevUsers) =>
        prevUsers.map((u) => (u.zalo_id === updatedUser.zalo_id ? updatedUser : u))
      );
      setIsEditing(false);
    } else {
      alert('Cập nhật thất bại!');
    }
    setIsSaving(false);
  };

  const handleEdit = () => {
    setSelectedRole(user.role ?? 'user');
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const displayRole = user.role && user.role !== 'user' ? user.role : 'Chưa set';

  return (
    <Box className="p-3 py-4 border-b border-gray-200 bg-white">
      <Box flex className="items-center justify-between mb-3">
        <Box flex className="items-center flex-1">
          <img
            src={user.avatar_url || 'https://placehold.co/40x40/EFEFEF/AAAAAA?text=?'}
            className="w-10 h-10 rounded-full"
            alt={user.name || 'User avatar'}
          />
          <Box className="ml-3 flex-1 min-w-0">
            <Text className="font-medium truncate">{user.name || 'Người dùng ẩn'}</Text>
            <Text size="xSmall" className="text-gray-500">
              Chức vụ: <Text className="font-medium text-gray-700 inline">{displayRole}</Text>
            </Text>
          </Box>
        </Box>

        {!isEditing && (
          <Button
            size="small"
            variant="secondary"
            onClick={handleEdit}
            className="ml-2 flex-shrink-0"
          >
            Sửa
          </Button>
        )}
      </Box>

      {/* Phần edit mode */}
      {isEditing && (
        <Box className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
          <Box className="flex-1 w-full sm:w-auto">
            <Select
              value={selectedRole}
              onChange={(val) => setSelectedRole(String(val ?? 'user'))}
              className="w-full"
            >
              {roles.map((r) => (
                <Select.Option key={r} value={r} title={r} />
              ))}
            </Select>
          </Box>
          <Box flex className="gap-2 w-full sm:w-auto justify-end">
            <Button
              size="small"
              variant="tertiary"
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 sm:flex-none"
            >
              Hủy
            </Button>
            <Button
              size="small"
              onClick={handleSave}
              loading={isSaving}
              disabled={isSaving || !user.zalo_id}
              className="flex-1 sm:flex-none"
            >
              Lưu
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};
