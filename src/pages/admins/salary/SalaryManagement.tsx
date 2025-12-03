import { Page, Box, Text, Icon, Avatar } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { totalSalaryPayoutSelector, validSalaryListSelector } from '@/states/state';
import { useSalaryData } from '@/hooks/useSalaryData';
import SalaryDashboard from './SalaryDashboard';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
};

const SalaryManagement = ({ onBack }: { onBack?: () => void }) => {
  const navigate = useNavigate();

  const { month, setMonth, year, setYear, loading } = useSalaryData();

  const totalPayout = useRecoilValue(totalSalaryPayoutSelector);
  const salaryList = useRecoilValue(validSalaryListSelector);

  const handleBackClick = () => {
    if (onBack) onBack();
    else navigate(-1);
  };

  return (
    <Page className="bg-gray-50 min-h-screen flex flex-col">
      <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600  px-4 py-4 pt-12 shadow-md sticky top-0 z-50">
        <Box className="flex items-center space-x-3">
          <Box onClick={handleBackClick} className="active:opacity-50 transition-opacity">
            <Icon icon="zi-arrow-left" className="text-white text-2xl" />
          </Box>
          <Text className="text-white font-bold text-xl">Quản lý lương</Text>
        </Box>
      </Box>

      <Box className="flex-1 p-4 overflow-y-auto">
        <SalaryDashboard
          month={month}
          year={year}
          setMonth={setMonth}
          setYear={setYear}
          totalPayout={totalPayout}
          totalStaff={salaryList.length}
          loading={loading}
        />

        <Box className="space-y-3 pb-32 ">
          {loading ? (
            <Box className="flex justify-center py-10">...</Box>
          ) : salaryList.length === 0 ? (
            <Text className="text-center text-gray-400 py-10">Không có dữ liệu.</Text>
          ) : (
            salaryList.map((item: any, idx: number) => (
              <Box
                key={idx}
                onClick={() =>
                  navigate('/salary-detail', { state: { salaryData: item, month, year } })
                }
                className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center mb-3"
              >
                <Box className="flex items-center space-x-3">
                  <Avatar src={item.user.avatar_url}>{item.user.name?.charAt(0)}</Avatar>
                  <Box>
                    <Text className="font-bold">{item.user.name}</Text>
                    <Text size="xSmall">{item.user.role}</Text>
                  </Box>
                </Box>
                <Text className="font-bold text-blue-600">
                  {formatCurrency(item.financials.finalSalary)}
                </Text>
              </Box>
            ))
          )}
        </Box>
      </Box>
    </Page>
  );
};

export default SalaryManagement;
