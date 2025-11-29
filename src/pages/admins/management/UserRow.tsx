import React, { useState } from 'react';
import { Box, Text, Select, Button, Icon } from 'zmp-ui';
import { User } from '@/types/users';
import { useSetRecoilState } from 'recoil';
import { allUsersState } from '@/states/state';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || '';

interface UserRowProps {
  user: User;
  roles: string[];
}

export const UserRow: React.FC<UserRowProps> = ({ user, roles }) => {
  const navigate = useNavigate();
  const setAllUsers = useSetRecoilState(allUsersState);

  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [inlineRole, setInlineRole] = useState(user.role ?? 'user');
  const [isSaving, setIsSaving] = useState(false);

  const isNewUser = !user.role || user.role === 'user';

  const handleUpdateRoleInline = async () => {
    if (!user.zalo_id) return;
    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/user/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zalo_id: user.zalo_id, role: inlineRole }),
      });
      if (res.ok) {
        const json = await res.json();
        const updatedUser = json.data;
        setAllUsers((prev) =>
          prev.map((u) => (u.zalo_id === updatedUser.zalo_id ? updatedUser : u))
        );
        setIsInlineEditing(false);
      } else {
        alert('Lỗi');
      }
    } catch (e) {
      console.log(e);
    }
    setIsSaving(false);
  };

  const displayRole = user.role && user.role !== 'user' ? user.role : 'Chưa set';

  const goToDetail = () => {
    navigate('/admin/user-detail', {
      state: { user: user, roles: roles },
    });
  };

  return (
    <Box className="p-3 py-4 border-b border-gray-200 bg-white hover:bg-gray-50 transition-colors">
      <Box flex className="items-center justify-between mb-3">
        <Box flex className="items-center flex-1">
          <img
            src={
              user.avatar_url || user.avatar || 'https://placehold.co/40x40/EFEFEF/AAAAAA?text=?'
            }
            className="w-12 h-12 rounded-full object-cover border border-gray-100"
            alt={user.name}
          />
          <Box className="ml-3 flex-1 min-w-0">
            <Text className="font-medium text-base truncate">{user.name || 'Người dùng ẩn'}</Text>
            <Text size="xSmall" className="text-gray-500 mt-0.5">
              Chức vụ: <Text className="font-bold text-blue-600 inline">{displayRole}</Text>
            </Text>
          </Box>
        </Box>

        {!isInlineEditing &&
          (isNewUser ? (
            <Button
              size="small"
              variant="secondary"
              onClick={() => {
                setInlineRole(user.role ?? 'user');
                setIsInlineEditing(true);
              }}
              className="ml-2 h-9"
            >
              Sửa
            </Button>
          ) : (
            <Button
              size="small"
              variant="tertiary"
              onClick={goToDetail}
              className="ml-2 h-9 text-blue-600 bg-blue-50 border-none pl-3 pr-3"
              icon={<Icon icon="zi-chevron-right" />}
            >
              Chi tiết
            </Button>
          ))}
      </Box>

      {isInlineEditing && isNewUser && (
        <Box className="flex gap-2 items-center bg-gray-50 p-3 rounded-xl animate-fadeIn mt-2">
          <Select
            value={inlineRole}
            onChange={(val) => setInlineRole(String(val ?? 'user'))}
            className="flex-1 bg-white h-10"
            placeholder="Chọn quyền..."
          >
            {roles.map((r) => (
              <Select.Option key={r} value={r} title={r} />
            ))}
          </Select>
          <Button
            size="small"
            variant="tertiary"
            onClick={() => setIsInlineEditing(false)}
            className="h-10"
          >
            Hủy
          </Button>
          <Button size="small" onClick={handleUpdateRoleInline} loading={isSaving} className="h-10">
            Lưu
          </Button>
        </Box>
      )}
    </Box>
  );
};
