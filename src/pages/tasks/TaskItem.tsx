import React from 'react';
import { Box, Text, Icon, Button } from 'zmp-ui';

interface TaskItemProps {
  task: any;
  isHistory?: boolean;
  onSubmit?: (id: number) => void;
  onViewDetail?: (task: any) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isHistory = false, onViewDetail }) => {
  const getDeadlineStatus = (dateStr: string) => {
    if (task.status === 'completed') {
      return {
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-100',
        text: 'ĐÃ HOÀN THÀNH',
        icon: 'zi-check-circle-solid',
      };
    }

    if (task.status === 'submitted') {
      return {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'ĐANG CHỜ DUYỆT',
        icon: 'zi-clock-1-solid',
      };
    }

    const deadline = new Date(dateStr).getTime();
    const now = new Date().getTime();
    const diffHours = (deadline - now) / (1000 * 60 * 60);

    if (diffHours < 0)
      return {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-100',
        text: 'QUÁ HẠN',
        icon: 'zi-warning-solid',
      };

    if (diffHours < 4)
      return {
        color: 'text-yellow-600',
        bg: 'bg-yellow-50',
        border: 'border-yellow-100',
        text: 'SẮP HẾT HẠN',
        icon: 'zi-clock-2-solid',
      };

    return {
      color: 'text-green-600',
      bg: 'bg-green-50',
      border: 'border-green-100',
      text: 'CÒN HẠN',
      icon: 'zi-check-circle-solid',
    };
  };

  const getStatusConfig = (status: string, dateStr: string) => {
    const isOverdue = new Date(dateStr).getTime() < new Date().getTime();

    if (status === 'pending' && isOverdue) {
      return {
        color: 'text-red-600',
        bg: 'bg-red-50',
        border: 'border-red-100',
        text: 'CHƯA HOÀN THÀNH',
        icon: 'zi-warning-solid',
        borderColor: 'border-red-500',
      };
    }

    const configs: any = {
      rework: {
        color: 'text-orange-600',
        bg: 'bg-orange-50',
        border: 'border-orange-100',
        text: 'CẦN LÀM LẠI',
        icon: 'zi-retry-solid',
        borderColor: 'border-orange-500',
      },
      submitted: {
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        border: 'border-blue-100',
        text: 'ĐANG CHỜ DUYỆT',
        icon: 'zi-clock-1-solid',
        borderColor: 'border-blue-500',
      },
      completed: {
        color: 'text-green-600',
        bg: 'bg-green-50',
        border: 'border-green-100',
        text: 'ĐÃ HOÀN THÀNH',
        icon: 'zi-check-circle-solid',
        borderColor: 'border-green-500',
      },
      pending: {
        color: 'text-slate-600',
        bg: 'bg-slate-50',
        border: 'border-slate-100',
        text: 'MỚI GIAO',
        icon: 'zi-note-solid',
        borderColor: 'border-blue-500',
      },
    };
    return configs[status] || configs.pending;
  };

  const deadline = getDeadlineStatus(task.due_date);
  const statusConfig = getStatusConfig(task.status, task.due_date);

  return (
    <Box
      className={` bg-white rounded-2xl border-l-4 p-4 mb-3 shadow-sm border ${statusConfig.borderColor}`}
    >
      <Box className="flex items-start justify-between mb-3">
        <Text className="font-bold text-base text-gray-800 flex-1 mr-2 line-clamp-2">
          {task.title}
        </Text>

        <Box
          className={`flex items-center gap-1 px-2 py-1 rounded-lg ${statusConfig.bg} border ${statusConfig.border}`}
        >
          <Icon icon={statusConfig.icon} size={12} className={statusConfig.color} />
          <Text size="xxSmall" className={`${statusConfig.color} font-bold`}>
            {statusConfig.text}
          </Text>
        </Box>
      </Box>

      <Box className="flex justify-between items-center pt-3 border-t border-gray-50">
        <Box
          className={`flex items-center gap-3 px-6 py-1.5 rounded-lg ${deadline.bg} border ${deadline.border}`}
        >
          <Icon icon={deadline.icon as any} size={16} className={deadline.color} />
          <Box>
            <Text size="xxSmall" className={`${deadline.color} font-bold uppercase`}>
              {deadline.text}
            </Text>
            <Text size="xxSmall" className="text-gray-500">
              {new Date(task.due_date).toLocaleString('vi-VN', {
                day: '2-digit',
                month: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Box>
        </Box>
        <Button
          size="small"
          onClick={() => onViewDetail && onViewDetail(task)}
          className="bg-blue-600 text-white border-0 font-semibold rounded-lg px-4 shadow-sm"
        >
          Chi tiết
        </Button>
      </Box>
    </Box>
  );
};

export default TaskItem;
