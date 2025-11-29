import { Box, Text } from 'zmp-ui';
import { useNavigate } from 'react-router-dom';

export const Feature = (): JSX.Element => {
  const navigate = useNavigate();

  const hanDleUpdate = () => {
    alert('Chức năng đang được phát triển!');
  };
  return (
    <Box className="grid grid-cols-2 gap-4 px-2">
      <Box
        onClick={() => navigate('/my-attendance')}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4"
      >
        <Text className="font-bold text-3xl">📊 </Text>
        <Text className="text-lg pt-1 text-gray-600">Lịch sử công</Text>
      </Box>

      <Box
        onClick={() => navigate('/user-salary-detail')}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4"
      >
        <Text className="font-bold text-3xl">💰</Text>
        <Text className="text-lg pt-1 text-gray-600">Bảng lương</Text>
      </Box>

      <button
        onClick={() => navigate('/leave-request')}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4"
      >
        <Text className="font-bold text-3xl">🏖️</Text>
        <Text className="text-lg pt-1 text-gray-600">Xin nghỉ phép</Text>
      </button>

      <Box
        onClick={() => hanDleUpdate()}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4"
      >
        <Text className="font-bold text-3xl">⚙️</Text>
        <Text className="text-lg pt-1 text-gray-600">Cài đặt</Text>
      </Box>

      <Box
        onClick={() => hanDleUpdate()}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4"
      >
        <Text className="font-bold text-3xl">🔔</Text>
        <Text className="text-lg pt-1 text-gray-600">Thông báo</Text>
      </Box>

      <Box
        onClick={() => hanDleUpdate()}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4"
      >
        <Text className="font-bold text-3xl">📞</Text>
        <Text className="text-lg pt-1 text-gray-600">Hỗ trợ</Text>
      </Box>
    </Box>
  );
};

export default Feature;
