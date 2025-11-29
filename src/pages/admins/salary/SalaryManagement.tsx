import React, { useState, useEffect, useMemo } from 'react';
import { Page, Box, Text, Icon, Avatar } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { userState } from '@/states/state';
import api from '@/lib/api';
import SalaryDashboard from './SalaryDashboard'; // Nhớ giữ file này nhé

// Interface dữ liệu
interface SalaryRecord {
  user: {
    zalo_id: string;
    name: string;
    avatar_url: string;
    role: string;
  };
  stats: {
    actualWorkDays: number;
    lateCount: number;
    earlyCount: number;
    absentDays: number;
  };
  financials: {
    base: number;
    bonus: number;
    fineLate: number;
    fineEarly: number;
    fineAbsent: number;
    insurance: number;
    totalIncome: number;
    totalDeduction: number;
    finalSalary: number;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

interface SalaryManagementProps {
  onBack?: () => void;
}

const SalaryManagement: React.FC<SalaryManagementProps> = ({ onBack }) => {
  const navigate = useNavigate();
  const currentUser = useRecoilValue(userState);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [salaryList, setSalaryList] = useState<SalaryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // --- GỌI API VÀ LỌC NHÂN VIÊN ---
  // ...
  useEffect(() => {
    const fetchSalaryData = async () => {
      if (!currentUser?.zalo_id) return;
      setLoading(true);
      try {
        const res: any = await api.get('/admin/salary-stats', {
          params: { month, year, period: 'month', admin_zalo_id: currentUser.zalo_id },
        });

        // --- THÊM 3 DÒNG LOG NÀY ---
        console.log('1. API Status:', res.success);
        console.log('2. Dữ liệu thô từ Backend:', res.data);
        if (res.data && res.data.length > 0) {
          console.log('3. Check Role người đầu tiên:', res.data[0].user.role);
        }
        // -----------------------------

        if (res.success && Array.isArray(res.data)) {
          // ... logic lọc cũ ...
          // 👇 ĐÂY LÀ ĐOẠN QUAN TRỌNG NHẤT 👇
          // Lọc danh sách: Chỉ giữ lại người CÓ ROLE và ROLE KHÁC 'user'
          const validList = res.data.filter((item: SalaryRecord) => {
            const r = item.user.role;
            // 1. Phải có role (khác null/undefined/rỗng)
            // 2. Role không được là 'user' (mặc định)
            return r && r !== 'user';
          });

          setSalaryList(validList);
        }
      } catch (error) {
        console.error('Lỗi tải bảng lương:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalaryData();
  }, [month, year, currentUser]);

  const totalPayout = useMemo(() => {
    return salaryList.reduce((sum, item) => sum + item.financials.finalSalary, 0);
  }, [salaryList]);

  const handleBackClick = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <Page className="bg-gray-50 min-h-screen flex flex-col">
      {/* Header Vàng Cam */}
      <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600  px-4 py-4 pt-12 shadow-md sticky top-0 z-50">
        <Box className="flex items-center space-x-3">
          <Box onClick={handleBackClick} className="active:opacity-50 transition-opacity">
            <Icon icon="zi-arrow-left" className="text-white text-2xl" />
          </Box>
          <Text className="text-white font-bold text-xl">Quản lý lương</Text>
        </Box>
      </Box>

      <Box className="flex-1 p-4 overflow-y-auto">
        {/* Dashboard Thống kê (File bạn vừa hỏi có cần giữ không -> CÓ) */}
        <SalaryDashboard
          month={month}
          year={year}
          setMonth={setMonth}
          setYear={setYear}
          totalPayout={totalPayout}
          totalStaff={salaryList.length}
          loading={loading}
        />

        <Text.Title className="mb-3 text-gray-700 pl-1">Bảng lương nhân viên</Text.Title>

        <Box className="space-y-3 pb-10">
          {loading ? (
            <Box className="flex justify-center py-10">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            </Box>
          ) : salaryList.length === 0 ? (
            <Text className="text-center text-gray-400 py-10">
              Không có nhân viên có chức vụ nào.
            </Text>
          ) : (
            salaryList.map((item, idx) => (
              <Box
                key={idx}
                className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center active:bg-orange-50 transition-all cursor-pointer border border-transparent hover:border-orange-200"
                onClick={() =>
                  navigate('/salary-detail', { state: { salaryData: item, month, year } })
                }
              >
                <Box className="flex items-center space-x-3">
                  <Avatar src={item.user.avatar_url || ''}>{item.user.name?.charAt(0)}</Avatar>
                  <Box>
                    <Text className="font-bold text-base">{item.user.name}</Text>
                    <Text className="text-gray-500 text-xs mt-0.5 capitalize">
                      {item.user.role} • {item.stats.actualWorkDays} công
                    </Text>
                  </Box>
                </Box>
                <Box className="text-right">
                  <Text className="font-bold text-blue-600 text-base">
                    {formatCurrency(item.financials.finalSalary)}
                  </Text>
                  <Icon icon="zi-chevron-right" className="text-gray-300 text-sm" />
                </Box>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Page>
  );
};

export default SalaryManagement;
