import { useState, useEffect, useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { userState } from '@/states/state';
import api from '@/lib/api';
import { getUserInfo, getPhoneNumber, getAccessToken } from 'zmp-sdk/apis';
import { useSnackbar } from 'zmp-ui';

export const useUserProfileLogic = () => {
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

  const parseDate = (dateStr: string) => {
    if (!dateStr || dateStr === '0000-00-00') return new Date();
    const rawDate = typeof dateStr === 'string' ? dateStr.split('T')[0] : '';
    const parts = rawDate.split('-');

    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date();
  };

  const formatDateForSave = (date: Date) => {
    if (!date) return null;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const fetchProfile = useCallback(async () => {
    if (!user?.zalo_id) return;
    setLoading(true);
    try {
      const res: any = await api.get('/users/me', { params: { zalo_id: user.zalo_id } });
      if (res.success && res.data) {
        const u = res.data;
        setUser((prev) => ({ ...prev, ...u }));

        setFormData({
          real_name: u.name || '',
          phone: u.phone || '',
          email: u.email || '',
          address: u.address || '',
          avatar_url: u.avatar_url || '',
          birthday: parseDate(u.birthday),
        });

        if (!u.name) setIsEditing(true);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.zalo_id, setUser]);

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
        birthday: formData.birthday ? formatDateForSave(formData.birthday) : null,
      });

      if (res.success) {
        openSnackbar({ text: 'Cập nhật thành công!', type: 'success' });
        setIsEditing(false);
        fetchProfile();
      } else {
        openSnackbar({ text: 'Lỗi cập nhật', type: 'error' });
      }
    } catch (error) {
      openSnackbar({ text: 'Lỗi kết nối', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const syncZalo = async () => {
    try {
      const info = await getUserInfo({});
      setFormData((prev) => ({
        ...prev,
        avatar_url: info.userInfo.avatar,
        real_name: prev.real_name || info.userInfo.name,
      }));
      openSnackbar({ text: 'Đã lấy ảnh từ Zalo', type: 'success' });
    } catch (error) {
      openSnackbar({ text: 'Lỗi lấy thông tin Zalo', type: 'error' });
    }
  };

  const getPhone = async () => {
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

  return {
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
  };
};
