import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Icon, useSnackbar, Modal } from 'zmp-ui';
import { useRecoilValue } from 'recoil';
import { userState } from '@/states/state';
import api from '@/lib/api';
import TaskItem from './TaskItem';
import { useNavigate } from 'react-router-dom';

const MyTasks = ({ onBack }: { onBack?: () => void }) => {
  const user = useRecoilValue(userState);
  const { openSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const [tasks, setTasks] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('todo');
  const [loading, setLoading] = useState(false);

  const [submitModal, setSubmitModal] = useState<{ visible: boolean; taskId: number | null }>({
    visible: false,
    taskId: null,
  });

  const fetchMyTasks = async () => {
    if (!user?.zalo_id) return;
    setLoading(true);
    try {
      const res: any = await api.get('/admin/task/list', {
        params: { zalo_id: user.zalo_id, type: 'my_tasks' },
      });
      if (res.success) {
        setTasks(res.data);
      }
    } catch (e) {
      console.error('Failed to fetch tasks:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTasks();
  }, [user?.zalo_id]);

  const confirmSubmit = async () => {
    if (!submitModal.taskId) return;
    try {
      await api.put('/admin/task/update', { id: submitModal.taskId, status: 'submitted' });
      openSnackbar({
        text: 'Nộp bài thành công! Đang chờ duyệt 🚀',
        type: 'success',
        icon: true,
        duration: 3000,
      });
      fetchMyTasks();
    } catch (error) {
      openSnackbar({ text: 'Lỗi khi nộp bài', type: 'error' });
    } finally {
      setSubmitModal({ visible: false, taskId: null });
    }
  };

  const todoList = tasks.filter((t) => ['pending', 'rework'].includes(t.status));
  const historyList = tasks.filter((t) => ['submitted', 'completed'].includes(t.status));

  const stats = {
    todo: todoList.length,
    done: tasks.filter((t) => t.status === 'completed').length,
    rework: tasks.filter((t) => t.status === 'rework').length,
  };

  return (
    <Page className="bg-gradient-to-br from-slate-50 to-blue-50/30 min-h-screen flex flex-col">
      <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 p-6 pt-14 pb-20 rounded-b-[48px] shadow-2xl relative overflow-hidden">
        <Box className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_20%,_white_1px,_transparent_1px)] bg-[length:20px_20px]"></Box>

        <Box className="relative z-10 flex items-center mb-6">
          {onBack && (
            <Box
              onClick={onBack}
              className="mr-3 p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-all duration-300 backdrop-blur-sm cursor-pointer"
            >
              <Icon icon="zi-arrow-left" className="text-white text-xl" />
            </Box>
          )}
          <Box className="flex-1">
            <Text className="text-white font-bold text-2xl mb-1">Công việc của tôi</Text>
            <Text className="text-blue-100 text-sm opacity-90">
              {loading ? 'Đang tải...' : `${tasks.length} công việc được giao`}
            </Text>
          </Box>
        </Box>

        <Box className="flex justify-between gap-4 relative z-10 mt-6">
          <Box className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 flex-1 text-center border border-white/30 shadow-lg">
            <Text className="text-white text-2xl font-bold drop-shadow-lg">{stats.todo}</Text>
            <Text className="text-blue-100 text-xs font-medium mt-1">Cần làm</Text>
          </Box>
          <Box className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 flex-1 text-center border border-white/30 shadow-lg">
            <Text className="text-emerald-200 text-2xl font-bold drop-shadow-lg">{stats.done}</Text>
            <Text className="text-emerald-100 text-xs font-medium mt-1">Hoàn thành</Text>
          </Box>
          <Box className="bg-white/20 backdrop-blur-xl rounded-2xl p-4 flex-1 text-center border border-white/30 shadow-lg">
            <Text className="text-amber-200 text-2xl font-bold drop-shadow-lg">{stats.rework}</Text>
            <Text className="text-amber-100 text-xs font-medium mt-1">Sửa lại</Text>
          </Box>
        </Box>
      </Box>

      <Box className="px-5 -mt-12 mb-6 relative z-20">
        <Box className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100/80 flex backdrop-blur-sm">
          <Box
            className={`flex-1 py-4 text-center rounded-xl transition-all duration-500 cursor-pointer flex items-center justify-center ${
              activeTab === 'todo'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105 font-bold'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/80'
            }`}
            onClick={() => setActiveTab('todo')}
          >
            <Icon
              icon={activeTab === 'todo' ? 'zi-note' : 'zi-list-1'}
              className="mr-2"
              size={16}
            />
            Cần làm
          </Box>
          <Box
            className={`flex-1 py-4 text-center rounded-xl transition-all duration-500 cursor-pointer flex items-center justify-center ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg transform scale-105 font-bold'
                : 'text-gray-600 hover:text-blue-600 hover:bg-gray-50/80'
            }`}
            onClick={() => setActiveTab('history')}
          >
            <Icon
              icon={activeTab === 'history' ? 'zi-clock-1' : 'zi-clock-2'}
              className="mr-2"
              size={16}
            />
            Lịch sử
          </Box>
        </Box>
      </Box>

      <Box className="px-5 pb-8 flex-1 overflow-y-auto">
        {loading ? (
          <Box className="text-center py-16">
            <Box className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></Box>
            <Text className="text-gray-500 font-medium">Đang tải công việc...</Text>
          </Box>
        ) : activeTab === 'todo' ? (
          todoList.length > 0 ? (
            <Box className="space-y-4 pb-28">
              {todoList.map((t) => (
                <TaskItem
                  key={t.id}
                  task={t}
                  onViewDetail={(task) => {
                    navigate(`/task-submit-detail?id=${task.id}`, { state: { task } });
                  }}
                />
              ))}
            </Box>
          ) : (
            <Box className="text-center py-20 opacity-80">
              <Box className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-green-200">
                <Text className="text-3xl">🎉</Text>
              </Box>
              <Text className="text-gray-600 font-semibold text-lg mb-2">Hết việc rồi!</Text>
              <Text className="text-gray-500">Thời gian để nghỉ ngơi hoặc học hỏi thêm</Text>
            </Box>
          )
        ) : historyList.length > 0 ? (
          <Box className="space-y-4">
            {historyList.map((t) => (
              <TaskItem
                key={t.id}
                task={t}
                isHistory={true}
                onViewDetail={(task) => {
                  navigate(`/task-submit-detail?id=${task.id}`, { state: { task } });
                }}
              />
            ))}
          </Box>
        ) : (
          <Box className="text-center py-20 opacity-80">
            <Box className="w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-blue-200">
              <Text className="text-3xl">📭</Text>
            </Box>
            <Text className="text-gray-600 font-semibold text-lg mb-2">Chưa có lịch sử</Text>
            <Text className="text-gray-500">Hoàn thành công việc đầu tiên để bắt đầu</Text>
          </Box>
        )}
      </Box>

      <Modal
        visible={submitModal.visible}
        title="Xác nhận nộp bài"
        onClose={() => setSubmitModal({ visible: false, taskId: null })}
        actions={[
          {
            text: 'Hủy',
            onClick: () => setSubmitModal({ visible: false, taskId: null }),
            highLight: false,
          },
          {
            text: 'Nộp ngay',
            onClick: confirmSubmit,
            highLight: true,
          },
        ]}
      >
        <Box className="p-4 text-center text-gray-600">
          Bạn có chắc chắn đã hoàn thành công việc này?
        </Box>
      </Modal>
    </Page>
  );
};

export default MyTasks;
