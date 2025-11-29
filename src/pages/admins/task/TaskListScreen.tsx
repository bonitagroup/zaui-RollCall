import React, { useState, useMemo } from 'react';
import { Box, Text, Avatar, Button, Icon } from 'zmp-ui';

const formatDateTime = (iso: string) => new Date(iso).toLocaleString('vi-VN');

interface ListTabProps {
  tasks: any[];
  selectedUser: string;
  onClearFilter: () => void;
  onViewDetail: (task: any) => void;
  onApprove: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

type TabType = 'active' | 'completed';

const ListTab: React.FC<ListTabProps> = ({
  tasks,
  selectedUser,
  onClearFilter,
  onViewDetail,
  onApprove,
  onDelete,
}) => {
  const [currentTab, setCurrentTab] = useState<TabType>('active');

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (currentTab === 'active') {
        return task.status !== 'completed';
      }
      return task.status === 'completed';
    });
  }, [tasks, currentTab]);

  return (
    <Box className="h-full flex flex-col bg-gray-50">
      <Box className="sticky top-0 z-50 bg-white pt-4 px-4 pb-2 shadow-sm mb-2">
        <Box className="bg-gray-100 p-1 rounded-xl flex relative">
          <Box
            className={`flex-1 py-2.5 text-center rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
              currentTab === 'active'
                ? 'bg-white text-blue-600 shadow-md'
                : 'text-gray-500 hover:bg-gray-200/50'
            }`}
            onClick={() => setCurrentTab('active')}
          >
            <Icon icon="zi-list-1" size={18} />
            Đã giao
          </Box>

          <Box
            className={`flex-1 py-2.5 text-center rounded-lg text-sm font-bold transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${
              currentTab === 'completed'
                ? 'bg-green-500 text-white shadow-md'
                : 'text-gray-500 hover:bg-gray-200/50'
            }`}
            onClick={() => setCurrentTab('completed')}
          >
            <Icon icon="zi-check-circle" size={18} />
            Hoàn thiện
          </Box>
        </Box>

        {selectedUser && (
          <Box className="flex justify-between items-center bg-blue-50 p-2 mt-3 rounded-lg border border-blue-100 animate-fadeIn">
            <Text size="xSmall" className="text-blue-800 flex items-center gap-1">
              <Icon icon="zi-user" size={14} /> Đang lọc: 1 nhân viên
            </Text>
            <Text
              size="xSmall"
              className="text-blue-600 font-bold cursor-pointer active:opacity-50 px-2 py-1 hover:bg-blue-100 rounded"
              onClick={onClearFilter}
            >
              Xóa lọc
            </Text>
          </Box>
        )}
      </Box>

      <Box className="flex-1 px-4 space-y-4 pb-24 overflow-y-auto">
        {filteredTasks.length === 0 ? (
          <Box className="flex flex-col items-center justify-center py-16 opacity-60">
            <Box className="bg-gray-200 rounded-full p-6 mb-4">
              <Icon icon="zi-inbox" className="text-gray-400" size={40} />
            </Box>
            <Text className="text-gray-500 font-medium">
              {currentTab === 'active' ? 'Không có việc đã giao!' : 'Chưa có việc hoàn thành'}
            </Text>
          </Box>
        ) : (
          filteredTasks.map((task) => {
            const isSubmitted = task.status === 'submitted';

            return (
              <Box
                key={task.id}
                className={`bg-white p-4 rounded-xl shadow-sm border-l-4 relative transition-transform active:scale-[0.98] ${
                  task.status === 'completed' ? 'border-green-500 opacity-90' : 'border-blue-500'
                }`}
              >
                <Box className="flex justify-between mb-2 items-start">
                  <Text className="font-bold text-lg flex-1 mr-2 line-clamp-1 text-slate-800">
                    {task.title}
                  </Text>
                  <StatusBadge status={task.status} />
                </Box>

                <Text className="text-gray-600 text-sm mb-4 line-clamp-2 font-light">
                  {task.description}
                </Text>

                <Box className="flex justify-between items-end border-t border-gray-50 pt-3 mt-1">
                  <Box>
                    <Box className="flex items-center gap-1 mb-2">
                      <Icon icon="zi-clock-1" size={14} className="text-red-400" />
                      <Text size="xSmall" className="text-red-500 font-medium">
                        {formatDateTime(task.due_date)}
                      </Text>
                    </Box>

                    <Box className="flex items-center gap-2 bg-gray-50 px-2 py-1 rounded-lg w-fit">
                      <Avatar src={task.assignee_avatar || ''} size={20} />
                      <Text
                        size="xSmall"
                        className="text-gray-600 font-medium truncate max-w-[100px]"
                      >
                        {task.assignee_name}
                      </Text>
                    </Box>
                  </Box>

                  <Box className="flex gap-2">
                    <Button
                      size="small"
                      variant="tertiary"
                      className="text-blue-600 bg-blue-50 hover:bg-blue-100 border-none"
                      onClick={() => onViewDetail(task)}
                    >
                      Chi tiết
                    </Button>

                    {currentTab === 'active' && (
                      <>
                        {isSubmitted ? (
                          <>
                            <Button
                              size="small"
                              className="bg-orange-500 text-white min-w-[70px] shadow-sm shadow-orange-200"
                              onClick={() => onApprove(task.id, 'rework')}
                            >
                              Làm lại
                            </Button>
                            <Button
                              size="small"
                              className="bg-green-500 text-white min-w-[70px] shadow-sm shadow-green-200"
                              onClick={() => onApprove(task.id, 'completed')}
                            >
                              Duyệt
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="small"
                            variant="secondary"
                            className="text-red-500 bg-red-50 border-none hover:bg-red-100"
                            onClick={() => onDelete(task.id)}
                          >
                            Xóa
                          </Button>
                        )}
                      </>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  let color = 'bg-gray-100 text-gray-600';
  let text = 'Mới giao';

  if (status === 'submitted') {
    color = 'bg-blue-100 text-blue-600';
    text = 'Chờ duyệt';
  }
  if (status === 'rework') {
    color = 'bg-orange-100 text-orange-600';
    text = 'Làm lại';
  }
  if (status === 'completed') {
    color = 'bg-green-100 text-green-600';
    text = 'Hoàn thành';
  }

  return (
    <Text size="xSmall" className={`px-3 py-1 rounded-full font-bold ${color}`}>
      {text}
    </Text>
  );
};

export default ListTab;
