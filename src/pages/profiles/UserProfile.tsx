import React, { useEffect } from 'react';
import {
  Page,
  Box,
  Text,
  Input,
  Button,
  Icon,
  Avatar,
  DatePicker,
  List,
  useSnackbar,
} from 'zmp-ui';
import { useUserProfileLogic } from '@/hooks/useUserProfileLogic';

const UserProfile = () => {
  const { openSnackbar } = useSnackbar(); // Để dùng cho nút Hủy

  // 1. Gọi Hook logic
  const {
    user,
    formData,
    setFormData,
    isEditing,
    setIsEditing,
    loading,
    handleSave,
    fetchProfile,
    syncZalo,
    getPhone,
  } = useUserProfileLogic();

  // Load profile khi vào trang
  useEffect(() => {
    fetchProfile();
  }, []);

  const getDisplayAvatar = () => formData.avatar_url || user?.avatar_url || '';

  // Helper hiển thị ngày tháng
  const formatDisplayDate = (date: Date) => {
    if (!date) return '---';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

  // --- GIAO DIỆN XEM (View Mode) ---
  const renderViewMode = () => (
    <Box className="p-4 animate-fadeIn">
      <Box className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col items-center mb-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-20" />
        <Avatar
          src={getDisplayAvatar()}
          size={80}
          className="border-4 border-white shadow-md mb-3 z-10"
        >
          {formData.real_name?.charAt(0)}
        </Avatar>
        <Text className="text-xl font-bold text-gray-800 z-10">
          {formData.real_name || 'Chưa cập nhật tên'}
        </Text>
        <Text className="text-sm text-gray-500 z-10">
          {user?.id ? `Mã NV: ${user.id}` : 'Nhân viên mới'}
        </Text>
      </Box>

      <Box className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <List>
          <List.Item title="Số điện thoại" subTitle={formData.phone || '---'} />
          <List.Item title="Email" subTitle={formData.email || '---'} />
          <List.Item title="Ngày sinh" subTitle={formatDisplayDate(formData.birthday)} />
          <List.Item title="Địa chỉ" subTitle={formData.address || '---'} />
        </List>
      </Box>

      <Box className="mt-6">
        <Button
          fullWidth
          onClick={() => setIsEditing(true)}
          className="bg-blue-600 rounded-xl flex items-center justify-center gap-2"
        >
          <Icon icon="zi-edit" /> Cập nhật thông tin
        </Button>
      </Box>
    </Box>
  );

  // --- GIAO DIỆN SỬA (Edit Mode) ---
  const renderEditMode = () => (
    <Box className="p-4 pb-20 animate-fadeIn">
      <Text className="font-bold text-xl mb-4 px-2">Cập nhật hồ sơ</Text>

      <Box className="flex flex-col items-center mb-6">
        <Box className="relative">
          <Avatar src={getDisplayAvatar()} size={80} />
          <Box
            className="absolute bottom-0 right-0 bg-gray-100 p-1.5 rounded-full border border-white cursor-pointer active:scale-90 transition-transform"
            onClick={syncZalo}
          >
            <Icon icon="zi-note" size={18} className="text-blue-600" />
          </Box>
        </Box>
      </Box>

      <Box className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <Box>
          <Box className="flex flex-row justify-between items-center">
            <Text className="font-medium text-sm mb-1 text-gray-700">
              Họ và tên thật <span className="text-red-500">*</span>
            </Text>

            <Text size="xSmall" className="text-blue-600 font-bold" onClick={syncZalo}>
              Đồng bộ tên Zalo
            </Text>
          </Box>
          <Input
            placeholder="Nhập họ tên đầy đủ..."
            value={formData.real_name}
            onChange={(e) => setFormData({ ...formData, real_name: e.target.value })}
            clearable
          />
        </Box>

        <Box>
          <Box className="flex justify-between items-center mb-1">
            <Text className="font-medium text-sm text-gray-700">Số điện thoại</Text>
            <Box
              onClick={getPhone}
              className="flex items-center space-x-1 active:opacity-50 cursor-pointer"
            >
              <Icon icon="zi-call" size={14} className="text-blue-600" />
              <Text size="xSmall" className="text-blue-600 font-bold">
                Lấy SĐT Zalo
              </Text>
            </Box>
          </Box>
          <Input
            type="number"
            placeholder="Nhập số điện thoại..."
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          />
        </Box>

        <Box>
          <Text className="font-medium text-sm mb-1 text-gray-700">Ngày sinh</Text>
          <DatePicker
            mask
            maskClosable
            dateFormat="dd/mm/yyyy"
            title="Chọn ngày sinh"
            value={formData.birthday}
            onChange={(value) => setFormData({ ...formData, birthday: value })}
          />
        </Box>

        <Box>
          <Text className="font-medium text-sm mb-1 text-gray-700">Email</Text>
          <Input
            type="text"
            placeholder="example@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Box>

        <Box>
          <Text className="font-medium text-sm mb-1 text-gray-700">Địa chỉ</Text>
          <Input.TextArea
            placeholder="Nhập địa chỉ hiện tại..."
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            showCount
          />
        </Box>
      </Box>

      <Box className="flex gap-3 mt-6">
        <Button
          fullWidth
          variant="secondary"
          onClick={() => {
            if (!user?.name)
              openSnackbar({ text: 'Bạn cần cập nhật thông tin lần đầu', type: 'warning' });
            else setIsEditing(false);
          }}
        >
          Hủy
        </Button>
        <Button fullWidth onClick={handleSave} loading={loading} className="bg-blue-600">
          Lưu hồ sơ
        </Button>
      </Box>
    </Box>
  );

  return (
    <Page className="bg-gray-50 min-h-screen pb-24">
      <Box className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-4 pt-10 flex items-center shadow-md sticky top-0 z-50 mb-2">
        <Text className="text-white font-bold text-xl flex-1 text-center">
          {isEditing ? 'Cập nhật thông tin' : 'Hồ sơ cá nhân'}
        </Text>
      </Box>
      {isEditing ? renderEditMode() : renderViewMode()}
    </Page>
  );
};

export default UserProfile;
