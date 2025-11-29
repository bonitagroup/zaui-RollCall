import React from 'react';
import { Box, Text, Select } from 'zmp-ui';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

interface Props {
  month: number;
  year: number;
  setMonth: (val: number) => void;
  setYear: (val: number) => void;
  totalPayout: number;
  totalStaff: number;
  loading: boolean;
}

const SalaryDashboard: React.FC<Props> = ({
  month,
  year,
  setMonth,
  setYear,
  totalPayout,
  totalStaff,
  loading,
}) => {
  return (
    <Box className="bg-white rounded-xl p-4 shadow-sm mb-4">
      <Text.Title className="mb-4 text-blue-800">Thống kê lương</Text.Title>

      <Box className="flex gap-3 mb-4">
        <div className="flex-1">
          <Text size="xSmall" className="text-gray-500 mb-1">
            Chọn Tháng
          </Text>
          <select
            className="w-full border rounded-lg p-2 bg-gray-50 font-bold text-gray-700 outline-none"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1">
          <Text size="xSmall" className="text-gray-500 mb-1">
            Chọn Năm
          </Text>
          <select
            className="w-full border rounded-lg p-2 bg-gray-50 font-bold text-gray-700 outline-none"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
          </select>
        </div>
      </Box>

      <Box className="bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-600 rounded-2xl p-5 text-white shadow-lg shadow-orange-200">
        <Text size="small" className="opacity-90 mb-1">
          Tổng thực chi (Dự tính)
        </Text>

        {loading ? (
          <div className="h-8 w-32 bg-white/30 animate-pulse rounded my-1"></div>
        ) : (
          <Text className="text-3xl font-bold tracking-tight">{formatCurrency(totalPayout)}</Text>
        )}

        <Box className="mt-4 pt-3 border-t border-white/20 flex justify-between text-xs items-center">
          <span className="bg-white/20 px-2 py-1 rounded">Nhân sự: {totalStaff}</span>
          <span>
            Kỳ: 05/{month === 1 ? 12 : month - 1} - 05/{month}
          </span>
        </Box>
      </Box>
    </Box>
  );
};

export default SalaryDashboard;
