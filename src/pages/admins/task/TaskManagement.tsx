import React, { useState, useEffect } from 'react';
import { Page, Box, Text, Icon, Modal, useSnackbar } from 'zmp-ui';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState, validEmployeesSelector, allUsersState } from '@/states/state';
import api from '@/lib/api';
import AssignTab from './AssignScreen';
import ListTab from './TaskListScreen';
import StatsTab from './StatsTab';
import CreateTaskModal from './CreateTaskModal';
import TaskDashboard from './TaskDashboard';
import TaskDetailScreen from './TaskDetailScreen';

const TaskManagement = ({ onBack }: { onBack: () => void }) => {
  const admin = useRecoilValue(userState);
  const employees = useRecoilValue(validEmployeesSelector);
  const allUsers = useRecoilValue(allUsersState);
  const setAllUsers = useSetRecoilState(allUsersState);
  const { openSnackbar } = useSnackbar();

  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [listType, setListType] = useState('active');
  const [tasks, setTasks] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const [deleteModal, setDeleteModal] = useState<{ visible: boolean; taskId: number | null }>({
    visible: false,
    taskId: null,
  });

  useEffect(() => {
    const fetchUsersIfNeeded = async () => {
      if (allUsers.length === 0 && admin?.zalo_id) {
        try {
          const res: any = await api.get('/admin/users', {
            params: { admin_zalo_id: admin.zalo_id },
          });
          if (res.success && Array.isArray(res.data)) setAllUsers(res.data);
        } catch (e) {}
      }
    };
    fetchUsersIfNeeded();
  }, [allUsers.length, admin?.zalo_id, setAllUsers]);

  const fetchTasks = async () => {
    try {
      const params: any = {};
      if (selectedUser) params.zalo_id = selectedUser;
      const res: any = await api.get('/admin/task/list', { params });
      if (res.success) setTasks(res.data);
    } catch (e) {}
  };

  useEffect(() => {
    if (currentScreen === 'list') fetchTasks();
  }, [currentScreen, selectedUser]);

  const handleCreateTask = async (data: { title: string; description: string; due_date: Date }) => {
    if (!selectedUser) return;
    try {
      const offset = data.due_date.getTimezoneOffset() * 60000;
      const localISOTime = new Date(data.due_date.getTime() - offset)
        .toISOString()
        .slice(0, 19)
        .replace('T', ' ');

      await api.post('/admin/task/create', {
        ...data,
        assignee_id: selectedUser,
        assigner_id: admin?.zalo_id,
        due_date: localISOTime,
      });
      setModalVisible(false);
      openSnackbar({
        icon: true,
        text: 'Giao việc thành công! 🎉',
        type: 'success',
        duration: 3000,
      });

      setCurrentScreen('list');
      setListType('active');
      fetchTasks();
    } catch (e) {
      openSnackbar({ text: 'Lỗi khi giao việc', type: 'error' });
    }
  };

  const handleUpdateTask = async (id: number, data: any) => {
    openSnackbar({ text: 'Cập nhật thành công', type: 'success' });
    fetchTasks();
  };

  const handleApprove = async (id: number, status: string) => {
    try {
      await api.put('/admin/task/update', { id, status });
      openSnackbar({ text: 'Đã cập nhật trạng thái', type: 'success' });
      fetchTasks();
      if (currentScreen === 'detail') setCurrentScreen('list');
    } catch (e) {
      openSnackbar({ text: 'Lỗi', type: 'error' });
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteModal({ visible: true, taskId: id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.taskId) return;
    try {
      await api.delete('/admin/task/delete', { params: { id: deleteModal.taskId } });
      openSnackbar({ text: 'Đã xóa', type: 'success' });
      fetchTasks();
      if (currentScreen === 'detail') setCurrentScreen('list');
    } catch (e) {
      openSnackbar({ text: 'Lỗi xóa', type: 'error' });
    } finally {
      setDeleteModal({ visible: false, taskId: null });
    }
  };

  const renderContent = () => {
    switch (currentScreen) {
      case 'dashboard':
        return (
          <TaskDashboard
            onNavigate={(screen, type) => {
              if (type) setListType(type);
              setCurrentScreen(screen);
              if (screen === 'list') setSelectedUser('');
            }}
          />
        );

      case 'assign':
        return (
          <AssignTab
            employees={employees}
            onSelectUser={(uid) => {
              setSelectedUser(uid);
              setListType('active');
              setCurrentScreen('list');
            }}
            onOpenCreateModal={(uid) => {
              setSelectedUser(uid);
              setModalVisible(true);
            }}
          />
        );

      case 'list':
        const filteredTasks = tasks.filter((t) => {
          if (listType === 'active') return ['pending', 'submitted', 'rework'].includes(t.status);
          if (listType === 'history') return ['completed'].includes(t.status);
          return true;
        });
        return (
          <ListTab
            tasks={filteredTasks}
            selectedUser={selectedUser}
            onClearFilter={() => {
              setSelectedUser('');
              fetchTasks();
            }}
            onViewDetail={(task) => {
              setSelectedTask(task);
              setCurrentScreen('detail');
            }}
            onApprove={handleApprove}
            onDelete={handleDeleteClick}
          />
        );

      case 'detail':
        return (
          <TaskDetailScreen
            task={selectedTask}
            onBack={() => setCurrentScreen('list')}
            onUpdate={handleUpdateTask}
            onApprove={handleApprove}
            onDelete={handleDeleteClick}
          />
        );

      case 'stats':
        return <StatsTab />;
      default:
        return null;
    }
  };

  return (
    <Page className="bg-gray-50 min-h-screen flex flex-col">
      {currentScreen === 'dashboard' && (
        <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 px-4 py-4 pt-12 flex items-center space-x-3 shadow-md sticky top-0 z-50">
          <Box onClick={onBack} className="active:opacity-50">
            <Icon icon="zi-arrow-left" className="text-white" />
          </Box>
          <Text className="text-white font-bold text-xl">Quản lý công việc</Text>
        </Box>
      )}

      {currentScreen !== 'dashboard' && currentScreen !== 'detail' && (
        <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white px-4 py-4 pt-12 flex items-center space-x-3 shadow-md sticky top-0 z-50">
          <Box onClick={() => setCurrentScreen('dashboard')} className="active:opacity-50">
            <Icon icon="zi-arrow-left" />
          </Box>
          <Text className="font-bold text-lg">
            {currentScreen === 'assign'
              ? 'Chọn nhân viên'
              : listType === 'active'
              ? 'Tiến độ công việc'
              : listType === 'history'
              ? 'Lịch sử hoàn thành'
              : 'Thống kê'}
          </Text>
        </Box>
      )}

      <Box className="flex-1 overflow-y-auto">{renderContent()}</Box>

      <CreateTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleCreateTask}
      />

      <Modal
        visible={deleteModal.visible}
        title="Xác nhận xóa"
        onClose={() => setDeleteModal({ visible: false, taskId: null })}
        actions={[
          { text: 'Hủy', onClick: () => setDeleteModal({ visible: false, taskId: null }) },
          { text: 'Xóa ngay', onClick: confirmDelete, highLight: true, danger: true },
        ]}
      >
        <Box className="p-4 text-center">Bạn có chắc chắn muốn xóa không?</Box>
      </Modal>
    </Page>
  );
};

export default TaskManagement;
