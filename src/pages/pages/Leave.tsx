import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Input, Button, Icon, useSnackbar, Tabs, Modal } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '@/states/state';
import api from '@/lib/api';

// --- Component Chọn Buổi ---
interface SessionSelectProps {
  value: string;
  onChange: (val: string) => void;
  label: string;
  type: 'start' | 'end';
}

const SessionSelect: React.FC<SessionSelectProps> = ({ value, onChange, label, type }) => {
  return (
    <Box className="flex flex-col">
      <Text size="xSmall" className="text-gray-500 mb-1">
        {label}
      </Text>
      <div className="relative w-full h-11 bg-white border border-[#e5e7eb] rounded-lg flex items-center px-3">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-full bg-transparent outline-none text-sm font-medium text-gray-800 appearance-none z-10"
        >
          <option value="morning">Buổi Sáng {type === 'end' ? '(Đến 12:00)' : '(Từ 08:00)'}</option>
          <option value="afternoon">
            Buổi Chiều {type === 'end' ? '(Đến 17:30)' : '(Từ 13:30)'}
          </option>
          <option value="all_day">Cả ngày</option>
        </select>
        <Icon icon="zi-chevron-down" className="absolute right-3 text-gray-400" size={16} />
      </div>
    </Box>
  );
};

// --- Component Chọn Ngày ---
interface CustomDatePickerProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
}

const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ label, value, onChange }) => {
  const dateToString = (d: Date) => {
    if (!d) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val) {
      onChange(new Date(val));
    }
  };

  const displayValue = value.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Box className="flex flex-col">
      {label && (
        <Text size="xSmall" className="text-gray-500 mb-1">
          {label}
        </Text>
      )}
      <div className="relative w-full h-11 bg-white border border-[#e5e7eb] rounded-lg flex items-center px-3 active:bg-gray-50">
        <Icon icon="zi-calendar" className="text-gray-500 mr-2" size={20} />
        <Text className="flex-1 text-gray-800 text-sm font-medium">{displayValue}</Text>
        <input
          type="date"
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
          value={dateToString(value)}
          onChange={handleDateChange}
        />
        <Icon icon="zi-chevron-down" className="text-gray-400" size={16} />
      </div>
    </Box>
  );
};

// --- Màn hình Chính ---
const LeaveRequestScreen = () => {
  const navigate = useNavigate();
  const { openSnackbar } = useSnackbar();
  const user = useRecoilValue(userState);

  const [activeTab, setActiveTab] = useState('create');

  // State Form
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [startSession, setStartSession] = useState('morning'); // morning | afternoon | all_day
  const [endSession, setEndSession] = useState('afternoon'); // morning | afternoon | all_day

  const [loading, setLoading] = useState(false);
  const [myRequests, setMyRequests] = useState<any[]>([]);

  // State Modal Xóa
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedDeleteId, setSelectedDeleteId] = useState<number | null>(null);

  const fetchMyRequests = async () => {
    if (!user?.zalo_id) return;
    try {
      const res: any = await api.get('/leave-requests/mine', {
        params: { zalo_id: user.zalo_id },
      });
      if (res.success) {
        setMyRequests(res.data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchMyRequests();
  }, [user]);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      openSnackbar({ text: 'Vui lòng nhập lý do nghỉ', type: 'error' });
      return;
    }

    const s = new Date(startDate);
    s.setHours(0, 0, 0, 0);
    const e = new Date(endDate);
    e.setHours(0, 0, 0, 0);

    // 1. Validate Ngày
    if (e < s) {
      openSnackbar({ text: 'Ngày kết thúc không được nhỏ hơn ngày bắt đầu', type: 'error' });
      return;
    }

    // 2. Logic Quy đổi "Cả ngày"
    // - Bắt đầu cả ngày => Hệ thống tính từ Sáng
    // - Kết thúc cả ngày => Hệ thống tính đến Chiều
    const finalStartSession = startSession === 'all_day' ? 'morning' : startSession;
    const finalEndSession = endSession === 'all_day' ? 'afternoon' : endSession;

    // 3. Validate Buổi (nếu cùng 1 ngày)
    if (s.getTime() === e.getTime()) {
      // Không thể bắt đầu Chiều mà kết thúc Sáng
      if (finalStartSession === 'afternoon' && finalEndSession === 'morning') {
        openSnackbar({
          text: 'Thời gian không hợp lệ (Bắt đầu Chiều -> Kết thúc Sáng)',
          type: 'error',
        });
        return;
      }
    }

    if (!user?.zalo_id) {
      openSnackbar({ text: 'Lỗi người dùng', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const res: any = await api.post('/leave-requests', {
        zalo_id: user.zalo_id,
        reason: reason,
        start_date: startDate,
        end_date: endDate,
        start_session: finalStartSession,
        end_session: finalEndSession,
      });

      if (res.success) {
        openSnackbar({ text: 'Gửi đơn thành công!', type: 'success' });
        // Reset Form
        setReason('');
        setStartDate(new Date());
        setEndDate(new Date());
        setStartSession('morning');
        setEndSession('afternoon');

        await fetchMyRequests();
        setActiveTab('pending');
      } else {
        openSnackbar({ text: 'Có lỗi xảy ra', type: 'error' });
      }
    } catch (error) {
      openSnackbar({ text: 'Lỗi kết nối', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // --- Xử lý Xóa ---
  const confirmDelete = (id: number) => {
    setSelectedDeleteId(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (!selectedDeleteId) return;
    try {
      const res: any = await api.delete(`/leave-requests/${selectedDeleteId}`);
      if (res.success) {
        openSnackbar({ text: 'Đã hủy đơn thành công', type: 'success' });
        fetchMyRequests(); // Reload lại list
        setDeleteModalVisible(false);
      } else {
        openSnackbar({ text: 'Lỗi khi hủy đơn', type: 'error' });
      }
    } catch (error) {
      openSnackbar({ text: 'Lỗi kết nối', type: 'error' });
    }
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Helper hiển thị tên buổi
  const getSessionDisplay = (session: string, type: 'start' | 'end') => {
    if (type === 'start') return session === 'morning' ? 'Sáng' : 'Chiều';
    return session === 'afternoon' ? 'Chiều' : 'Sáng';
  };

  // --- Item Danh Sách ---
  const RequestItem = ({ item }: { item: any }) => {
    // Kiểm tra xem có phải nghỉ trọn vẹn 1 ngày (cùng ngày, sáng->chiều) không
    const isFullDaySameDate =
      new Date(item.start_date).getTime() === new Date(item.end_date).getTime() &&
      item.start_session === 'morning' &&
      item.end_session === 'afternoon';

    return (
      <Box className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm mb-3">
        <Box className="flex justify-between items-start mb-2">
          <Box>
            <Text size="xSmall" className="text-gray-500">
              Gửi ngày: {formatDate(item.created_at)}
            </Text>

            <Box className="flex items-center gap-2 mt-1">
              <Icon icon="zi-calendar" className="text-blue-500" size={18} />
              <Box>
                {isFullDaySameDate ? (
                  // Trường hợp: Cả ngày
                  <Text className="font-bold text-gray-800 text-sm">
                    {formatDate(item.start_date)}{' '}
                    <span className="text-purple-600 font-bold">(Cả ngày)</span>
                  </Text>
                ) : (
                  // Trường hợp: Lẻ buổi hoặc nhiều ngày
                  <>
                    <Text className="font-bold text-gray-800 text-sm">
                      {formatDate(item.start_date)}{' '}
                      <span className="text-blue-600 font-normal">
                        ({getSessionDisplay(item.start_session, 'start')})
                      </span>
                    </Text>
                    {/* Nếu khác ngày thì hiện dòng 2, nếu cùng ngày thì hiện ngang */}
                    {item.start_date !== item.end_date && (
                      <Text className="text-xs text-gray-400">đến</Text>
                    )}
                    {item.start_date !== item.end_date && (
                      <Text className="font-bold text-gray-800 text-sm">
                        {formatDate(item.end_date)}{' '}
                        <span className="text-blue-600 font-normal">
                          ({getSessionDisplay(item.end_session, 'end')})
                        </span>
                      </Text>
                    )}
                    {/* Nếu cùng ngày mà lẻ buổi (Sáng->Sáng hoặc Chiều->Chiều) */}
                    {item.start_date === item.end_date && (
                      <Text className="text-xs text-gray-500 font-normal italic ml-1">
                        (chỉ buổi {getSessionDisplay(item.start_session, 'start')})
                      </Text>
                    )}
                  </>
                )}
              </Box>
            </Box>
          </Box>

          <Box className="flex flex-col items-end gap-2">
            <Box
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                item.status === 'pending'
                  ? 'bg-orange-50 text-orange-600 border-orange-200'
                  : item.status === 'approved'
                  ? 'bg-green-50 text-green-600 border-green-200'
                  : 'bg-red-50 text-red-600 border-red-200'
              }`}
            >
              {item.status === 'pending'
                ? 'Chờ duyệt'
                : item.status === 'approved'
                ? 'Đã duyệt'
                : 'Từ chối'}
            </Box>

            {/* Chỉ hiện nút Hủy nếu đang pending */}
            {item.status === 'pending' && (
              <Button
                size="small"
                variant="tertiary"
                className="bg-red-50 text-red-600 h-7 px-2 text-xs"
                onClick={() => confirmDelete(item.id)}
              >
                Hủy đơn
              </Button>
            )}
          </Box>
        </Box>
        <Text className="text-sm text-gray-600 bg-gray-50 p-2 rounded">Lý do: {item.reason}</Text>
      </Box>
    );
  };

  return (
    <Page className="bg-white min-h-screen flex flex-col">
      <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 px-4 py-4 pt-12 flex items-center space-x-3 shadow-md sticky top-0 z-50">
        <Box onClick={() => navigate(-1)} className="active:opacity-50 mr-3">
          <Icon icon="zi-arrow-left" className="text-white text-2xl" />
        </Box>
        <Text className="text-white font-bold text-xl flex-1">Nghỉ phép</Text>
      </Box>

      <Box className="flex-1 flex flex-col pt-2">
        <Tabs
          id="leave-request-tabs"
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key)}
          className="flex-1 flex flex-col"
        >
          {/* TAB TẠO ĐƠN */}
          <Tabs.Tab key="create" label="Tạo đơn">
            <Box className="p-5 space-y-6 h-full overflow-y-auto pb-20">
              <Box>
                <Text className="font-bold text-gray-700 mb-2">Thời gian nghỉ</Text>

                {/* Dòng 1: Từ ngày */}
                <Box className="flex gap-3 mb-3">
                  <Box className="flex-[1.5]">
                    <CustomDatePicker label="Từ ngày" value={startDate} onChange={setStartDate} />
                  </Box>
                  <Box className="flex-1">
                    <SessionSelect
                      label="Bắt đầu"
                      value={startSession}
                      onChange={setStartSession}
                      type="start"
                    />
                  </Box>
                </Box>

                {/* Dòng 2: Đến ngày */}
                <Box className="flex gap-3">
                  <Box className="flex-[1.5]">
                    <CustomDatePicker label="Đến ngày" value={endDate} onChange={setEndDate} />
                  </Box>
                  <Box className="flex-1">
                    <SessionSelect
                      label="Kết thúc"
                      value={endSession}
                      onChange={setEndSession}
                      type="end"
                    />
                  </Box>
                </Box>
              </Box>

              <Box>
                <Text className="font-bold text-gray-700 mb-2">Lý do</Text>
                <Input.TextArea
                  placeholder="Nhập lý do..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  showCount
                  maxLength={500}
                  rows={4}
                />
              </Box>

              <Box className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <Text size="small" className="text-blue-800">
                  <Icon icon="zi-info-circle" className="mr-1 inline" />
                  Lưu ý:
                </Text>

                <ul className="list-disc pl-5 text-xs text-blue-700 mt-1 space-y-1">
                  <li>Đơn nghỉ cần được duyệt bởi quản lý.</li>

                  <li>
                    Ngày nghỉ được duyệt sẽ <b>không tính lương</b>.
                  </li>

                  <li>
                    Ngày nghỉ được duyệt sẽ <b>không bị trừ thưởng chuyên cần</b>.
                  </li>
                </ul>
              </Box>

              <Button
                fullWidth
                onClick={handleSubmit}
                loading={loading}
                className="bg-blue-600 mt-4"
              >
                Gửi đơn
              </Button>
            </Box>
          </Tabs.Tab>

          <Tabs.Tab key="pending" label="Chờ duyệt">
            <Box className="p-4 bg-gray-50 h-full overflow-y-auto pb-20">
              {myRequests.filter((r) => r.status === 'pending').length === 0 ? (
                <Box className="flex flex-col items-center mt-10 opacity-50">
                  <Icon icon="zi-inbox" size={48} className="text-gray-400 mb-2" />
                  <Text className="text-gray-400">Không có đơn đang chờ</Text>
                </Box>
              ) : (
                myRequests
                  .filter((r) => r.status === 'pending')
                  .map((item) => <RequestItem key={item.id} item={item} />)
              )}
            </Box>
          </Tabs.Tab>

          <Tabs.Tab key="history" label="Lịch sử">
            <Box className="p-4 bg-gray-50 h-full overflow-y-auto pb-20">
              {myRequests.filter((r) => r.status !== 'pending').length === 0 ? (
                <Box className="flex flex-col items-center mt-10 opacity-50">
                  <Icon icon="zi-clock-1" size={48} className="text-gray-400 mb-2" />
                  <Text className="text-gray-400">Chưa có lịch sử</Text>
                </Box>
              ) : (
                myRequests
                  .filter((r) => r.status !== 'pending')
                  .map((item) => <RequestItem key={item.id} item={item} />)
              )}
            </Box>
          </Tabs.Tab>
        </Tabs>
      </Box>

      <Modal
        visible={deleteModalVisible}
        title="Xác nhận hủy đơn"
        onClose={() => setDeleteModalVisible(false)}
        description="Bạn có chắc chắn muốn hủy đơn nghỉ phép này không? Hành động này không thể hoàn tác."
        actions={[
          {
            text: 'Quay lại',
            onClick: () => setDeleteModalVisible(false),
          },
          {
            text: 'Hủy đơn',
            highLight: true,
            danger: true,
            onClick: handleDelete,
          },
        ]}
      />
    </Page>
  );
};

export default LeaveRequestScreen;
