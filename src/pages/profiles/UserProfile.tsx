import React, { useState, useEffect } from 'react';
import {
  Page,
  Box,
  Text,
  Input,
  Button,
  Icon,
  Avatar,
  DatePicker,
  useSnackbar,
  List,
} from 'zmp-ui';
import { useRecoilState } from 'recoil';
import { userState } from '@/states/state';
import { getPhoneNumber, getUserInfo, getAccessToken } from 'zmp-sdk/apis';
import api from '@/lib/api';

const UserProfile = () => {
  const [user, setUser] = useRecoilState(userState);
  const { openSnackbar } = useSnackbar();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    real_name: '',
    phone: '',
    email: '',
    address: '',
    avatar_url: '',
    birthday: new Date(),
  });

  const getDisplayAvatar = () => {
    return formData.avatar_url || user?.avatar_url || user?.avatar || '';
  };

  // --- HÀM MỚI: Chuyển chuỗi từ DB (YYYY-MM-DD) sang Date Object (Local Time) ---
  // Giúp hiển thị đúng ngày trên DatePicker
  const parseDateFromDB = (dateStr: string) => {
    if (!dateStr || dateStr === '0000-00-00') return new Date();

    // Xử lý cả trường hợp ISO string hoặc YYYY-MM-DD
    const rawDate = typeof dateStr === 'string' ? dateStr.split('T')[0] : '';
    const parts = rawDate.split('-'); // [2004, 08, 10]

    if (parts.length === 3) {
      // Lưu ý: new Date(năm, tháng - 1, ngày) sẽ tạo giờ địa phương 00:00:00
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date();
  };

  const fetchProfile = async () => {
    if (!user || !user.zalo_id) return;

    try {
      setLoading(true);
      const res: any = await api.get('/users/me', { params: { zalo_id: user.zalo_id } });

      if (res.success && res.data) {
        const u = res.data;
        setUser((prev) => ({ ...prev, ...u }));

        // --- SỬA ĐOẠN NÀY: Dùng hàm parse thủ công ---
        let birthDateObj = new Date();
        if (u.birthday) {
          birthDateObj = parseDateFromDB(u.birthday);
        }
        // ---------------------------------------------

        setFormData({
          real_name: u.name || '',
          phone: u.phone || '',
          email: u.email || '',
          address: u.address || '',
          avatar_url: u.avatar_url || '',
          birthday: birthDateObj,
        });

        if (!u.name) {
          setIsEditing(true);
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.zalo_id]);

  const handleSyncZaloInfo = async () => {
    try {
      const info = await getUserInfo({});
      setFormData((prev) => ({
        ...prev,
        avatar_url: info.userInfo.avatar,
        real_name: prev.real_name || info.userInfo.name,
      }));
      openSnackbar({ text: 'Đã đồng bộ thông tin Zalo', type: 'success' });
    } catch (error) {
      openSnackbar({ text: 'Lỗi lấy thông tin Zalo', type: 'error' });
    }
  };

  const handleGetPhoneNumber = async () => {
    try {
      const phoneData = await getPhoneNumber({});

      if (!phoneData || !phoneData.token) {
        openSnackbar({ text: 'Bạn đã từ chối cấp quyền SĐT', type: 'error' });
        return;
      }

      const accessToken = await getAccessToken({});

      const res: any = await api.post('/users/phone', {
        token: phoneData.token,
        access_token: accessToken,
      });

      if (res.success && res.phone) {
        setFormData((prev) => ({ ...prev, phone: res.phone }));
        openSnackbar({ text: 'Lấy số điện thoại thành công!', type: 'success' });
      } else {
        openSnackbar({ text: 'Lỗi giải mã: ' + (res.message || 'Không rõ'), type: 'error' });
      }
    } catch (error) {
      console.error(error);
      openSnackbar({ text: 'Lỗi khi lấy SĐT hoặc User từ chối', type: 'error' });
    }
  };

  // --- HÀM QUAN TRỌNG: Format Date thành chuỗi YYYY-MM-DD theo giờ địa phương ---
  const formatDateForSave = (date: Date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    if (!formData.real_name.trim()) {
      openSnackbar({ text: 'Vui lòng nhập họ tên thật', type: 'error' });
      return;
    }
    if (!user?.zalo_id) {
      openSnackbar({ text: 'Lỗi: Không tìm thấy ID người dùng', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res: any = await api.put('/users/update', {
        zalo_id: user.zalo_id,
        ...formData,
        // --- SỬA ĐOẠN NÀY: Dùng hàm format thủ công ---
        birthday: formData.birthday ? formatDateForSave(formData.birthday) : null,
      });

      if (res.success) {
        openSnackbar({ text: 'Cập nhật thành công!', type: 'success' });
        setIsEditing(false);
        fetchProfile(); // Load lại dữ liệu để đảm bảo hiển thị đúng cái vừa lưu
      } else {
        openSnackbar({ text: 'Lỗi cập nhật', type: 'error' });
      }
    } catch (error) {
      openSnackbar({ text: 'Lỗi kết nối', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Hàm hiển thị view mode (Lấy từ state date object)
  const formatDisplayDate = (date: Date) => {
    if (!date) return '---';
    // Vì formData.birthday đã được xử lý là Local Date chuẩn ở fetchProfile
    // Nên hiển thị ra cũng sẽ chuẩn
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
  };

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
          <Icon icon="zi-edit" />
          Cập nhật thông tin
        </Button>
      </Box>
    </Box>
  );

  const renderEditMode = () => (
    <Box className="p-4 pb-20 animate-fadeIn">
      <Text className="font-bold text-xl mb-4 px-2">Cập nhật hồ sơ</Text>

      <Box className="flex flex-col items-center mb-6">
        <Box className="relative">
          <Avatar src={getDisplayAvatar()} size={80} />
          <Box
            className="absolute bottom-0 right-0 bg-gray-100 p-1.5 rounded-full border border-white cursor-pointer active:scale-90 transition-transform"
            onClick={handleSyncZaloInfo}
          >
            <Icon icon="zi-note" size={18} className="text-blue-600" />
          </Box>
        </Box>
        <Text size="xSmall" className="text-blue-600 mt-2 font-medium" onClick={handleSyncZaloInfo}>
          Đồng bộ ảnh Zalo
        </Text>
      </Box>

      <Box className="space-y-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <Box>
          <Text className="font-medium text-sm mb-1 text-gray-700">
            Họ và tên thật <span className="text-red-500">*</span>
          </Text>
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
              onClick={handleGetPhoneNumber}
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
            if (!user?.name) {
              openSnackbar({ text: 'Bạn cần cập nhật thông tin lần đầu', type: 'warning' });
            } else {
              setIsEditing(false);
            }
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
