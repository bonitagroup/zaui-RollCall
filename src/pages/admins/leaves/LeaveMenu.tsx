import React from 'react';
import { Box, Text, Icon } from 'zmp-ui';

interface LeaveMenuProps {
  onBack: () => void;
  onSelectOption: (option: 'pending' | 'history') => void;
  pendingCount: number;
}

const LeaveMenu: React.FC<LeaveMenuProps> = ({ onBack, onSelectOption, pendingCount }) => {
  return (
    <Box className="flex flex-col h-full bg-[#F4F6F8]">
      <style>
        {`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-slide-up {
            animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .delay-100 { animation-delay: 0.1s; }
          .delay-200 { animation-delay: 0.2s; }
        `}
      </style>

      <Box className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-4 pt-12 flex items-center space-x-3 shadow-lg sticky top-0 z-50 ">
        <Box onClick={onBack} className="active:opacity-50 mr-3 cursor-pointer p-1">
          <Icon icon="zi-arrow-left" className="text-white text-2xl" />
        </Box>
        <Text className="text-white font-bold text-xl flex-1">Quản lý nghỉ phép</Text>
      </Box>

      <Box className="p-5 space-y-5 mt-2">
        <Text className="text-gray-500 font-semibold text-sm ml-2 uppercase tracking-wider opacity-80 animate-slide-up">
          Danh mục
        </Text>

        <Box
          onClick={() => onSelectOption('pending')}
          className="relative bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(234,88,12,0.15)] border border-white flex items-center justify-between active:scale-[0.97] transition-all duration-300 cursor-pointer overflow-hidden group animate-slide-up delay-100"
        >
          <div className="absolute right-0 top-0 w-32 h-32 bg-orange-400 rounded-full blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity" />

          <Box className="flex items-center gap-5 z-10">
            <Box className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center shadow-inner group-hover:bg-orange-100 transition-colors">
              <Icon icon="zi-clock-1" className="text-orange-500 text-3xl drop-shadow-sm" />
            </Box>
            <Box>
              <Text className="font-bold text-lg text-gray-800 group-hover:text-orange-600 transition-colors">
                Cần duyệt
              </Text>
              <Text className="text-xs text-gray-500 mt-1 font-medium">Danh sách chờ xử lý</Text>
            </Box>
          </Box>

          <Box className="flex items-center gap-3 z-10">
            {pendingCount > 0 ? (
              <div className="relative">
                <div className="absolute -inset-1 bg-red-500 rounded-full opacity-30 animate-ping"></div>
                <Box className="relative bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg border-2 border-white">
                  {pendingCount > 99 ? '99+' : pendingCount}
                </Box>
              </div>
            ) : (
              <Box className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                <Icon icon="zi-check" className="text-gray-300 text-sm" />
              </Box>
            )}
            <Icon
              icon="zi-chevron-right"
              className="text-gray-300 group-hover:translate-x-1 transition-transform"
            />
          </Box>
        </Box>

        <Box
          onClick={() => onSelectOption('history')}
          className="relative bg-white p-5 rounded-3xl shadow-[0_8px_20px_rgba(22,163,74,0.15)] border border-white flex items-center justify-between active:scale-[0.97] transition-all duration-300 cursor-pointer overflow-hidden group animate-slide-up delay-200"
        >
          <div className="absolute right-0 bottom-0 w-32 h-32 bg-green-400 rounded-full blur-[50px] opacity-10 group-hover:opacity-20 transition-opacity" />

          <Box className="flex items-center gap-5 z-10">
            <Box className="w-16 h-16 rounded-2xl bg-green-50 flex items-center justify-center shadow-inner group-hover:bg-green-100 transition-colors">
              <Icon icon="zi-note" className="text-green-600 text-3xl drop-shadow-sm" />
            </Box>
            <Box>
              <Text className="font-bold text-lg text-gray-800 group-hover:text-green-700 transition-colors">
                Lịch sử duyệt
              </Text>
              <Text className="text-xs text-gray-500 mt-1 font-medium">Tra cứu đơn đã xong</Text>
            </Box>
          </Box>
          <Box className="z-10">
            <Icon
              icon="zi-chevron-right"
              className="text-gray-300 group-hover:translate-x-1 transition-transform"
            />
          </Box>
        </Box>
      </Box>

      <Box className="flex-1 flex items-end justify-center pb-8 opacity-30">
        <Icon icon="zi-note" className="text-gray-300 text-[100px]" />
      </Box>
    </Box>
  );
};

export default LeaveMenu;
