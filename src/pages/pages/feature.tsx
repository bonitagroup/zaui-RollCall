import { Box, Text } from 'zmp-ui';

export const Feature = (): JSX.Element => {
  const hanDleUpdate = () => {
    alert('Chức năng đang được phát triển!');
  };
  return (
    <Box className="grid grid-cols-2 gap-4 px-2">
      <Box
        onClick={() => hanDleUpdate()}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4"
      >
        <Text className="font-bold text-3xl">📊 </Text>
        <Text className="text-lg pt-1 text-gray-600">Lịch sử công</Text>
      </Box>

      <Box
        onClick={() => hanDleUpdate()}
        className="flex flex-col shadow-lg text-center bg-white rounded-xl p-4"
      >
        <Text className="font-bold text-3xl">💰</Text>
        <Text className="text-lg pt-1 text-gray-600">Bảng lương</Text>
      </Box>

      <button
        onClick={() => hanDleUpdate()}
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
