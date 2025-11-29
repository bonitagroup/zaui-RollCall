import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Icon, Avatar, Select } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '@/states/state';
import api from '@/lib/api';

const { Option } = Select;

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const UserSalaryDetail = () => {
  const navigate = useNavigate();
  const currentUser = useRecoilValue(userState);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaryData, setSalaryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isFineDetailsOpen, setIsFineDetailsOpen] = useState(false);

  const fetchMySalary = async () => {
    if (!currentUser) return;
    setLoading(true);
    setSalaryData(null);

    try {
      const res: any = await api.get('/admin/salary-stats', {
        params: {
          month,
          year,
          period: 'month',
          admin_zalo_id: currentUser.zalo_id,
        },
      });

      if (res.success && Array.isArray(res.data)) {
        const myRecord = res.data.find((item: any) => item.user.zalo_id === currentUser.zalo_id);
        if (myRecord) {
          setSalaryData(myRecord);
        }
      }
    } catch (error) {
      console.error('Lỗi lấy lương:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMySalary();
  }, [month, year, currentUser]);

  if (loading) {
    return (
      <Page className="bg-white flex justify-center items-center min-h-screen">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </Page>
    );
  }

  if (!loading && !salaryData) {
    return (
      <Page className="bg-gray-50 min-h-screen">
        <Box className="bg-white px-4 py-4 pt-12 flex items-center space-x-3 shadow-sm sticky top-0 z-50">
          <Box onClick={() => navigate(-1)} className="active:opacity-50">
            <Icon icon="zi-arrow-left" className="text-gray-800 text-2xl" />
          </Box>
          <Text className="text-gray-800 font-bold text-xl">Lương của tôi</Text>
        </Box>

        <Box className="p-4 bg-white mt-2 mb-4 mx-4 rounded-xl shadow-sm flex gap-3">
          <Select
            value={month}
            onChange={(val) => setMonth(Number(val))}
            placeholder="Chọn tháng"
            closeOnSelect
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <Option key={m} value={m} title={`Tháng ${m}`} />
            ))}
          </Select>
          <Select
            value={year}
            onChange={(val) => setYear(Number(val))}
            placeholder="Chọn năm"
            closeOnSelect
          >
            <Option value={2024} title="Năm 2024" />
            <Option value={2025} title="Năm 2025" />
          </Select>
        </Box>

        <Box className="flex flex-col items-center justify-center pt-10 text-gray-400">
          <Icon icon="zi-note" className="text-5xl mb-2 opacity-30" />
          <Text>
            Không tìm thấy dữ liệu lương tháng {month}/{year}
          </Text>
        </Box>
      </Page>
    );
  }

  const { user, stats, financials, adjustments } = salaryData;
  const displayLateFine = financials.fineLate;
  const displayEarlyFine = financials.fineEarly;
  const displayAbsentFine = financials.fineAbsentAmount;
  const totalRawPenalty = displayLateFine + displayEarlyFine + displayAbsentFine;

  return (
    <Page className="bg-gray-100 min-h-screen flex flex-col">
      <Box className="bg-blue-600 px-4 py-4 pt-12 flex items-center space-x-3 shadow-md sticky top-0 z-50">
        <Box onClick={() => navigate(-1)} className="active:opacity-50">
          <Icon icon="zi-arrow-left" className="text-white text-2xl" />
        </Box>
        <Text className="text-white font-bold text-xl">Phiếu lương</Text>
      </Box>

      <Box className="flex-1 p-4 overflow-y-auto pb-10">
        <Box className="bg-white rounded-xl p-4 mb-4 shadow-sm flex items-center space-x-3 border-l-4 border-blue-500">
          <Avatar src={user.avatar_url} size={48}>
            {user.name?.charAt(0)}
          </Avatar>
          <Box>
            <Text className="font-bold text-lg">{user.name}</Text>
            <Text size="xSmall" className="text-gray-500 uppercase">
              {user.role} • {stats.actualWorkDays} công
            </Text>
          </Box>
        </Box>

        <Box className="bg-white p-3 rounded-xl shadow-sm mb-4 flex gap-2 items-center justify-between">
          <Text className="text-gray-500 font-medium text-sm pl-1">Kỳ lương:</Text>
          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-sm font-bold text-blue-700 outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="bg-gray-50 border border-gray-200 rounded-md px-2 py-1 text-sm font-bold text-blue-700 outline-none"
            >
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
          </div>
        </Box>

        <Box className="bg-white rounded-xl p-5 shadow-sm">
          <Text className="font-bold text-lg mb-4 border-b pb-2 text-gray-800">
            Chi tiết thu nhập
          </Text>

          <Box className="space-y-3 mb-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Lương cơ bản</span>
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
                      className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded"
                    >
                      <span>{item.note}</span>
                      <span>+{formatCurrency(item.amount)}</span>
                    </div>
                  );
                }
                return null;
              })}

            <div className="flex justify-between font-bold bg-blue-50 p-2 rounded text-blue-800 mt-2">
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
              className="flex justify-between text-red-600 font-bold cursor-pointer select-none active:opacity-70 pt-2"
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
              <Box className="bg-red-50 p-3 rounded-md mt-2 flex flex-col gap-2 transition-all duration-300 border border-red-100">
                {displayLateFine > 0 && (
                  <div className="flex justify-between text-red-500 text-xs">
                    <span>
                      • Muộn ({stats.totalLateMinutes}p{' '}
                      {stats.totalLateCount > 0 ? `(${stats.totalLateCount} lần)` : ''})
                    </span>
                    <span>-{formatCurrency(displayLateFine)}</span>
                  </div>
                )}
                {displayEarlyFine > 0 && (
                  <div className="flex justify-between text-red-500 text-xs">
                    <span>
                      • Sớm ({stats.totalEarlyMinutes}p{' '}
                      {stats.totalEarlyCount > 0 ? `(${stats.totalEarlyCount} lần)` : ''})
                    </span>
                    <span>-{formatCurrency(displayEarlyFine)}</span>
                  </div>
                )}
                {displayAbsentFine > 0 && (
                  <div className="flex justify-between text-red-500 text-xs">
                    <span>• Vắng ({stats.absentDays} ngày)</span>
                    <span>-{formatCurrency(displayAbsentFine)}</span>
                  </div>
                )}
                {totalRawPenalty === 0 && (
                  <div className="text-center text-xs text-gray-400 italic">Không vi phạm</div>
                )}
              </Box>
            )}

            {adjustments &&
              adjustments.map((item: any) => {
                if (item.amount < 0) {
                  return (
                    <div
                      key={item.id}
                      className="flex justify-between items-center text-red-500 bg-red-50 p-2 rounded"
                    >
                      <span>{item.note}</span>
                      <span>-{formatCurrency(Math.abs(item.amount))}</span>
                    </div>
                  );
                }
                return null;
              })}

            <div className="flex justify-between text-orange-600 pt-2">
              <span>Bảo hiểm (10.5%)</span>
              <span>-{formatCurrency(financials.insurance)}</span>
            </div>

            <div className="flex justify-between font-bold bg-red-50 p-2 rounded text-red-700 mt-2">
              <span>Tổng khấu trừ</span>
              <span>-{formatCurrency(financials.totalDeduction)}</span>
            </div>
          </Box>

          <div className="border-t border-gray-400 my-4"></div>

          <Box className="flex justify-between items-end pb-2">
            <Text className="text-gray-800 font-medium">THỰC LĨNH</Text>
            <Text className="font-bold text-3xl text-blue-600">
              {formatCurrency(financials.finalSalary)}
            </Text>
          </Box>
        </Box>
      </Box>
    </Page>
  );
};

export default UserSalaryDetail;
