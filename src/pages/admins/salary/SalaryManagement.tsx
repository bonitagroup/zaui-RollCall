import { Box, Text } from 'zmp-ui';
interface SalaryManagementProps {
  onBack: () => void;
}

const SalaryManagement: React.FC<SalaryManagementProps> = ({ onBack }) => {
  return (
    <Box className="p-6">
      <Box className="text-center py-12">
        <Box className="w-20 h-20 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Text className="text-3xl">💰</Text>
        </Box>
        <Text className="text-gray-600 text-lg font-bold mb-2">Quản lý lương</Text>
        <Text size="xSmall" className="text-gray-400">
          Tính năng đang được phát triển
        </Text>
      </Box>
    </Box>
  );
};

export default SalaryManagement;
