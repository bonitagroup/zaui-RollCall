import React, { useState } from 'react';
import { Page, Box, Text, Icon, Button, Avatar, Modal, Input, useSnackbar } from 'zmp-ui';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '@/lib/api';
import { useRecoilValue } from 'recoil';
import { userState } from '@/states/state';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const SalaryDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSnackbar } = useSnackbar();
  const currentUser = useRecoilValue(userState);

  const { salaryData: initialData, month, year } = location.state || {};
  const [salaryData, setSalaryData] = useState(initialData);

  const [isFineDetailsOpen, setIsFineDetailsOpen] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [adjustType, setAdjustType] = useState<'bonus' | 'fine'>('bonus');
  const [amountInput, setAmountInput] = useState('');
  const [noteInput, setNoteInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!salaryData) return null;

  const { user, stats, financials, adjustments } = salaryData;

  const displayLateFine = financials.fineLate;
  const displayEarlyFine = financials.fineEarly;
  const displayAbsentFine = financials.fineAbsentAmount;
  const totalRawPenalty = displayLateFine + displayEarlyFine + displayAbsentFine;

  const refreshData = async () => {
    try {
      const res: any = await api.get('/admin/salary-stats', {
        params: { month, year, period: 'month', admin_zalo_id: currentUser?.zalo_id },
      });
      if (res.success && Array.isArray(res.data)) {
        const updatedRecord = res.data.find((r: any) => r.user.zalo_id === user.zalo_id);
        if (updatedRecord) setSalaryData(updatedRecord);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddAdjustment = async () => {
    if (isSubmitting) return;
    if (!amountInput) return;
    const value = Number(amountInput.replace(/\D/g, ''));
    const finalAmount = adjustType === 'bonus' ? value : -value;
    const finalNote = noteInput || (adjustType === 'bonus' ? 'Thưởng nóng' : 'Phạt vi phạm');

    setIsSubmitting(true);
    try {
      await api.post('/admin/salary-adjust', {
        zalo_id: user.zalo_id,
        month,
        year,
        amount: finalAmount,
        note: finalNote,
      });
      openSnackbar({ text: 'Thành công!', type: 'success' });
      setModalVisible(false);
      setAmountInput('');
      setNoteInput('');
      await refreshData();
    } catch (error) {
      openSnackbar({ text: 'Lỗi', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdjustment = async (id: number) => {
    try {
      await api.delete(`/admin/salary-adjust/${id}`, {
        params: {
          admin_zalo_id: currentUser?.zalo_id,
        },
      });

      openSnackbar({ text: 'Đã xóa!', type: 'success' });
      await refreshData();
    } catch (error) {
      console.error(error);
      openSnackbar({ text: 'Lỗi xóa (Quyền Admin)', type: 'error' });
    }
  };

  return (
    <Page className="bg-gray-100 min-h-screen flex flex-col">
      <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 px-4 py-4 pt-12 flex items-center space-x-3 shadow-sm sticky top-0 z-50">
        <Box onClick={() => navigate(-1)} className="active:opacity-50">
          <Icon icon="zi-arrow-left" className="text-gray-800 text-2xl" />
        </Box>
        <Text className="text-gray-800 font-bold text-xl">Chi tiết phiếu lương</Text>
      </Box>

      <Box className="flex-1 p-4 overflow-y-auto pb-36">
        <Box className="bg-white rounded-xl p-4 mb-4 shadow-sm flex justify-between items-center">
          <Box className="flex items-center space-x-3">
            <Avatar src={user.avatar_url} size={48}>
              {user.name?.charAt(0)}
            </Avatar>
            <Box>
              <Text className="font-bold text-lg">{user.name}</Text>
              <Text size="xSmall" className="text-gray-500 uppercase">
                {user.role}
              </Text>
            </Box>
          </Box>
          <Box className="text-right">
            <Text size="xSmall" className="text-gray-500">
              Kỳ lương
            </Text>
            <Text className="font-bold text-blue-600 text-sm">
              Tháng {month}/{year}
            </Text>
          </Box>
        </Box>

        <Box className="bg-white rounded-xl p-5 shadow-sm">
          <Text className="font-bold text-lg mb-4 border-b pb-2">Thu nhập & Khấu trừ</Text>

          <Box className="space-y-3 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Lương cơ bản ({stats.actualWorkDays} công)</span>
              <span className="font-medium">{formatCurrency(financials.base)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thưởng chuyên cần</span>
              <span className="font-medium text-green-600">
                +{formatCurrency(financials.bonus)}
              </span>
            </div>

            {adjustments &&
              adjustments.map((item: any) => {
                if (item.amount > 0) {
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-green-600 bg-green-50 p-1 rounded animate-fadeIn"
                    >
                      <div className="flex items-center gap-1">
                        <span>{item.note}</span>
                        <div
                          onClick={() => handleDeleteAdjustment(item.id)}
                          className="cursor-pointer active:scale-110 transition-transform p-1 flex justify-center"
                        >
                          <Icon
                            icon="zi-close-circle"
                            className="text-red-400 text-lg leading-none"
                          />
                        </div>
                      </div>
                      <span>+{formatCurrency(item.amount)}</span>
                    </div>
                  );
                }
                return null;
              })}

            <div className="flex justify-between font-bold bg-gray-50 p-2 rounded text-gray-700 mt-2">
              <span>Tổng thu nhập</span>
              <span>{formatCurrency(financials.totalIncome)}</span>
            </div>
          </Box>

          <div className="border-t border-dashed border-gray-300 my-4 relative">
            <div className="absolute -left-7 -top-3 w-6 h-6 bg-gray-100 rounded-full"></div>
            <div className="absolute -right-7 -top-3 w-6 h-6 bg-gray-100 rounded-full"></div>
          </div>

          <Box className="space-y-3 mb-4 text-sm">
            <div
              className="flex justify-between text-red-600 font-bold cursor-pointer select-none active:opacity-70 pt-4"
              onClick={() => setIsFineDetailsOpen(!isFineDetailsOpen)}
            >
              <div className="flex items-center gap-1">
                <span>Trừ chuyên cần</span>
                <Icon
                  icon="zi-chevron-down"
                  className={`transition-transform duration-300 text-xl ${
                    isFineDetailsOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
              <span>-{formatCurrency(financials.fineAbsent)}</span>
            </div>

            {isFineDetailsOpen && (
              <Box className="bg-gray-50 p-3 rounded-md mt-2 flex flex-col gap-2 transition-all duration-300 animate-fadeIn">
                {displayLateFine > 0 && (
                  <div className="flex justify-between text-red-500 text-xs">
                    <span>• Phạt phút muộn ({stats.totalLateMinutes}p)</span>
                    <span>-{formatCurrency(displayLateFine)}</span>
                  </div>
                )}
                {displayEarlyFine > 0 && (
                  <div className="flex justify-between text-red-500 text-xs">
                    <span>• Phạt phút sớm ({stats.totalEarlyMinutes}p)</span>
                    <span>-{formatCurrency(displayEarlyFine)}</span>
                  </div>
                )}
                {displayAbsentFine > 0 && (
                  <div className="flex justify-between text-red-500 text-xs">
                    <span>• Trừ vắng mặt ({stats.absentDays} ngày)</span>
                    <span>-{formatCurrency(displayAbsentFine)}</span>
                  </div>
                )}
                {totalRawPenalty > 2000000 && (
                  <div className="text-center text-[10px] text-gray-500 italic border-t border-red-200 pt-1 mt-1">
                    (Tổng phạt thực tế {formatCurrency(totalRawPenalty)}, chỉ trừ 2tr)
                  </div>
                )}
                {totalRawPenalty === 0 && (
                  <div className="text-center text-xs text-gray-400 italic">
                    Không có lỗi vi phạm
                  </div>
                )}
              </Box>
            )}

            {adjustments &&
              adjustments.map((item: any) => {
                if (item.amount < 0) {
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-red-500 bg-red-50 p-1 rounded animate-fadeIn"
                    >
                      <div className="flex items-center gap-1">
                        <span>{item.note}</span>
                        <div
                          onClick={() => handleDeleteAdjustment(item.id)}
                          className="cursor-pointer active:scale-110 transition-transform p-1 flex justify-center"
                        >
                          <Icon
                            icon="zi-close-circle"
                            className="text-gray-400 text-lg leading-none"
                          />
                        </div>
                      </div>
                      <span>-{formatCurrency(Math.abs(item.amount))}</span>
                    </div>
                  );
                }
                return null;
              })}

            <div className="flex justify-between text-orange-500 pt-2">
              <span>Bảo hiểm (10.5%)</span>
              <span>-{formatCurrency(financials.insurance)}</span>
            </div>

            <div className="flex justify-between font-bold bg-red-50 p-2 rounded text-red-700 mt-2">
              <span>Tổng khấu trừ</span>
              <span>-{formatCurrency(financials.totalDeduction)}</span>
            </div>
          </Box>

          <div className="border-t border-gray-200 my-4"></div>

          <Box className="flex justify-between items-end pb-4">
            <Text className="text-gray-800 font-medium">THỰC LĨNH</Text>
            <Text className="font-bold text-3xl text-blue-600">
              {formatCurrency(financials.finalSalary)}
            </Text>
          </Box>
          <div className="border-t border-dashed border-gray-300 my-4 relative">
            <div className="absolute -left-7 -top-3 w-6 h-6 bg-gray-100 rounded-full"></div>
            <div className="absolute -right-7 -top-3 w-6 h-6 bg-gray-100 rounded-full"></div>
          </div>
        </Box>

        <Box className="mt-4 flex gap-3">
          <Button
            fullWidth
            variant="secondary"
            className="border-green-500 text-green-600 bg-white"
            onClick={() => {
              setAdjustType('bonus');
              setModalVisible(true);
            }}
          >
            + Thưởng thêm
          </Button>
          <Button
            fullWidth
            variant="secondary"
            className="border-red-500 text-red-600 bg-white"
            onClick={() => {
              setAdjustType('fine');
              setModalVisible(true);
            }}
          >
            - Phạt thêm
          </Button>
        </Box>
      </Box>

      <Modal
        visible={modalVisible}
        title={adjustType === 'bonus' ? 'Thêm thưởng' : 'Thêm phạt'}
        onClose={() => setModalVisible(false)}
        actions={[
          { text: 'Hủy', onClick: () => setModalVisible(false) },
          { text: 'Lưu', onClick: handleAddAdjustment, highLight: true },
        ]}
      >
        <Box className="p-4 space-y-4">
          <Input
            type="number"
            label="Số tiền (VNĐ)"
            placeholder="Ví dụ: 500000"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            autoFocus
          />
          <Input
            label="Lý do"
            placeholder={adjustType === 'bonus' ? 'Thưởng dự án...' : 'Làm hỏng thiết bị...'}
            value={noteInput}
            onChange={(e) => setNoteInput(e.target.value)}
          />
        </Box>
      </Modal>
    </Page>
  );
};

export default SalaryDetail;
