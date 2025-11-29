import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Select, Button, Avatar, Icon, useSnackbar, Modal } from 'zmp-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { allUsersState } from '@/states/state';
import { User } from '@/types/users';

const API_URL = import.meta.env.VITE_API_URL || '';

const UserDetailAdmin = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const setAllUsers = useSetRecoilState(allUsersState);

  const initialUser = state?.user as User;
  const roles = state?.roles as string[];

  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);
  const [selectedRole, setSelectedRole] = useState(initialUser?.role || 'user');

  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    const fetchLatestUserData = async () => {
      if (!initialUser?.zalo_id) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${API_URL}/api/users/me?zalo_id=${initialUser.zalo_id}&t=${new Date().getTime()}`
        );
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setCurrentUser(json.data);
            setSelectedRole(json.data.role || 'user');
          }
        }
      } catch (error) {
        console.error('Lỗi tải thông tin user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestUserData();
  }, [initialUser?.zalo_id]);

  if (!currentUser && !loading) {
    navigate(-1);
    return null;
  }

  const formatDate = (dateStr?: string | Date) => {
    if (!dateStr || dateStr === '0000-00-00') return 'Chưa cập nhật';
    const str = String(dateStr);
    const rawDate = str.substring(0, 10);
    const parts = rawDate.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      return `${day}/${month}/${year}`;
    }
    return 'Chưa cập nhật';
  };

  const handleSave = async () => {
    if (!currentUser?.zalo_id) return;

    setIsSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/users/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zalo_id: currentUser.zalo_id,
          role: selectedRole,
        }),
      });

      if (res.ok) {
        const json = await res.json();

        setAllUsers((prevUsers) =>
          prevUsers.map((u) =>
            u.zalo_id === currentUser.zalo_id ? { ...u, role: selectedRole } : u
          )
        );

        openSnackbar({ text: 'Cập nhật thành công!', type: 'success' });
        navigate(-1);
      } else {
        openSnackbar({ text: 'Lỗi cập nhật', type: 'error' });
      }
    } catch (e) {
      openSnackbar({ text: 'Lỗi kết nối', type: 'error' });
    }
    setIsSaving(false);
  };

  const handleDeleteUser = async () => {
    if (!currentUser?.zalo_id) return;

    try {
      const res = await fetch(`${API_URL}/api/users/${currentUser.zalo_id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setAllUsers((prev) => prev.filter((u) => u.zalo_id !== currentUser.zalo_id));
        openSnackbar({ text: 'Đã xóa nhân viên', type: 'success' });
        navigate(-1);
      } else {
        openSnackbar({ text: 'Lỗi khi xóa', type: 'error' });
      }
    } catch (error) {
      openSnackbar({ text: 'Lỗi kết nối', type: 'error' });
    }
  };

  const InfoBlock = ({ label, value, fullWidth = false }: any) => (
    <Box className={`flex flex-col ${fullWidth ? 'col-span-2' : 'col-span-1'}`}>
      <Text size="xSmall" className="text-gray-500 mb-1 uppercase font-semibold text-[10px]">
        {label}
      </Text>
      <Box className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm min-h-[40px]">
        {loading ? (
          <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse"></div>
        ) : (
          <Text className="text-gray-800 font-medium text-sm break-words">{value}</Text>
        )}
      </Box>
    </Box>
  );

  return (
    <Page className="bg-gray-50 min-h-screen flex flex-col">
      <Box className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-4 pt-12 flex items-center space-x-3 shadow-md sticky top-0 z-50">
        <Box onClick={() => navigate(-1)} className="active:opacity-50 mr-2 p-1 cursor-pointer">
          <Icon icon="zi-arrow-left" className="text-white text-2xl" />
        </Box>
        <Text className="text-white font-bold text-xl flex-1">Chi tiết nhân viên</Text>
      </Box>

      <Box className="flex-1 p-4 pb-32 overflow-y-auto">
        <Box className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex flex-col items-center mb-6">
          <Avatar
            src={currentUser?.avatar_url || currentUser?.avatar}
            size={80}
            className="mb-3 border-4 border-blue-50 shadow-md"
          >
            {currentUser?.name?.charAt(0)}
          </Avatar>
          <Text className="font-bold text-xl text-gray-800">
            {currentUser?.name || 'Đang tải...'}
          </Text>
          <Text className="text-gray-500 text-sm mt-1">ID: {currentUser?.id || '...'}</Text>
          <Box className="mt-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
            {selectedRole.toUpperCase()}
          </Box>
        </Box>

        <Text className="font-bold text-gray-700 mb-3 px-1 text-lg">Thông tin cá nhân</Text>
        <div className="grid grid-cols-2 gap-3 mb-6">
          <InfoBlock label="Số điện thoại" value={currentUser?.phone || 'Chưa cập nhật'} />
          <InfoBlock label="Ngày sinh" value={formatDate(currentUser?.birthday)} />
          <InfoBlock label="Email" value={currentUser?.email || 'Chưa cập nhật'} fullWidth />
          <InfoBlock label="Địa chỉ" value={currentUser?.address || 'Chưa cập nhật'} fullWidth />
        </div>

        <Text className="font-bold text-gray-700 mb-3 px-1 text-lg">Phân quyền hệ thống</Text>
        <Box className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 mb-6">
          <Text size="small" className="mb-2 text-gray-500">
            Thay đổi chức vụ
          </Text>
          <Select
            value={selectedRole}
            onChange={(val) => setSelectedRole(String(val))}
            className="w-full h-12 text-base"
            label="Chọn chức vụ"
            placeholder="Chọn quyền..."
            closeOnSelect
          >
            {roles?.map((r) => (
              <Select.Option key={r} value={r} title={r} />
            ))}
          </Select>
        </Box>

        <Box className="flex justify-center mt-8">
          <Button
            variant="tertiary"
            className="text-red-500 font-bold bg-red-100 w-full"
            onClick={() => setShowConfirmDelete(true)}
          >
            Xóa người dùng này
          </Button>
        </Box>
      </Box>

      <Box className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] flex gap-3 z-50">
        <Button
          variant="secondary"
          fullWidth
          size="large"
          onClick={() => navigate(-1)}
          className="rounded-xl"
        >
          Quay lại
        </Button>
        <Button
          fullWidth
          size="large"
          onClick={handleSave}
          loading={isSaving}
          className="bg-blue-600 rounded-xl"
        >
          Lưu thay đổi
        </Button>
      </Box>

      <Modal
        visible={showConfirmDelete}
        title="Xóa nhân viên?"
        onClose={() => setShowConfirmDelete(false)}
        actions={[
          { text: 'Hủy', onClick: () => setShowConfirmDelete(false) },
          { text: 'Xóa', danger: true, highLight: true, onClick: handleDeleteUser },
        ]}
      >
        <Box className="text-center px-4">
          <Text>
            Bạn có chắc chắn muốn xóa <b>{currentUser?.name}</b> khỏi hệ thống?
          </Text>
          <Text className="text-red-500 text-xs mt-2 block">Hành động này không thể hoàn tác.</Text>
        </Box>
      </Modal>
    </Page>
  );
};

export default UserDetailAdmin;
