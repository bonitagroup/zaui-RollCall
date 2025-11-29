import React, { useState } from 'react';
import { Page, Box, Text, Icon, Button, Input } from 'zmp-ui';

const formatDate = (d: string) => new Date(d).toLocaleString('vi-VN');

interface TaskDetailProps {
  task: any;
  onBack: () => void;
  onUpdate: (id: number, data: any) => void;
  onApprove: (id: number, status: string) => void;
  onDelete: (id: number) => void;
}

const TaskDetailScreen: React.FC<TaskDetailProps> = ({
  task,
  onBack,
  onUpdate,
  onApprove,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ ...task });

  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const isSubmitted = task.status === 'submitted';
  const isCompleted = task.status === 'completed';

  const handleSave = () => {
    onUpdate(task.id, editData);
    setIsEditing(false);
  };

  const getReportImages = () => {
    if (!task.report_image) return [];
    try {
      const parsed = JSON.parse(task.report_image);
      return Array.isArray(parsed) ? parsed : [task.report_image];
    } catch {
      return [task.report_image];
    }
  };

  const reportImages = getReportImages();

  return (
    <Page className="bg-white min-h-screen flex flex-col relative">
      {previewImage && (
        <Box
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <Box
            className="absolute top-10 left-4 p-2 bg-white/40 rounded-full cursor-pointer active:bg-white/40 transition-all"
            onClick={() => setPreviewImage(null)}
          >
            <Icon
              icon="zi-close"
              className="text-white text-2xl flex justify-center items-center"
            />
          </Box>

          <img
            src={previewImage}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            alt="preview full"
            onClick={(e) => e.stopPropagation()}
          />
        </Box>
      )}

      <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 px-4 py-4 pt-12 flex items-center space-x-3 shadow-md sticky top-0 z-50">
        <Box onClick={onBack} className="active:opacity-50 mr-3">
          <Icon icon="zi-arrow-left" className="text-white text-2xl" />
        </Box>
        <Text className="text-white font-bold text-xl flex-1">Chi tiết công việc</Text>
      </Box>

      <Box className="flex-1 p-5 overflow-y-auto pb-24">
        <Box className="flex justify-center mb-6">
          <Box
            className={`px-4 py-1.5 rounded-full font-bold text-sm border ${
              task.status === 'pending'
                ? 'bg-gray-50 text-gray-600 border-gray-200'
                : task.status === 'submitted'
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : task.status === 'rework'
                ? 'bg-orange-50 text-orange-600 border-orange-200'
                : 'bg-green-50 text-green-600 border-green-200'
            }`}
          >
            {task.status === 'pending'
              ? 'Đang thực hiện'
              : task.status === 'submitted'
              ? 'Chờ duyệt'
              : task.status === 'rework'
              ? 'Yêu cầu làm lại'
              : 'Đã hoàn thành'}
          </Box>
        </Box>

        <Box className="space-y-6">
          <Box>
            <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Tên công việc</Text>
            {isEditing ? (
              <Input
                value={editData.title}
                onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              />
            ) : (
              <Text className="text-xl font-bold text-gray-800">{task.title}</Text>
            )}
          </Box>

          <Box>
            <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Mô tả chi tiết</Text>
            {isEditing ? (
              <Input.TextArea
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                rows={5}
              />
            ) : (
              <Text className="text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100 whitespace-pre-wrap">
                {task.description}
              </Text>
            )}
          </Box>

          <Box>
            <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Hạn hoàn thành</Text>
            <Box className="flex items-center gap-2 text-red-500 font-medium bg-red-50 p-2 rounded-lg w-fit">
              <Icon icon="zi-clock-1" />
              {formatDate(task.due_date)}
            </Box>
          </Box>

          <Box>
            <Text className="text-gray-500 text-xs font-bold uppercase mb-1">Người thực hiện</Text>
            <Box className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
              <img
                src={task.assignee_avatar}
                className="w-10 h-10 rounded-full border border-white"
                alt=""
              />
              <Text className="font-bold text-blue-800">{task.assignee_name}</Text>
            </Box>
          </Box>

          <Box className="mt-6 border-t pt-4 bg-blue-50 p-4 rounded-xl">
            <Text className="font-bold text-blue-700 mb-2">Báo cáo từ nhân viên</Text>
            <Box className="flex justify-between mb-2">
              <Text size="small">Tiến độ:</Text>
              <Text className="font-bold text-green-600">{task.progress || 0}%</Text>
            </Box>
            <Box className="w-full bg-gray-200 h-2 rounded-full mb-3">
              <Box
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${task.progress || 0}%` }}
              />
            </Box>
            <Text className="text-gray-700 bg-white p-3 rounded border border-blue-100 mb-3 whitespace-pre-wrap">
              {task.report_content || 'Chưa có nội dung báo cáo'}
            </Text>

            {reportImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {reportImages.map((url: string, idx: number) => (
                  <img
                    key={idx}
                    src={url}
                    onClick={() => setPreviewImage(url)}
                    className="w-full aspect-square object-cover rounded-lg border border-gray-200 bg-white cursor-pointer active:opacity-80 transition-opacity"
                    alt="thumbnail"
                  />
                ))}
              </div>
            ) : (
              <Text size="small" className="text-gray-400 italic">
                Không có ảnh minh chứng
              </Text>
            )}
          </Box>

          <Box className="absolute flex justify-end left-80 bottom-28">
            {!isCompleted && !isEditing && (
              <Box
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 p-4 rounded-full shadow-lg cursor-pointer"
              >
                <Icon icon="zi-edit" className="text-white" />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box className="p-4 border-t bg-white fixed bottom-0 left-0 right-0 shadow-top-lg">
        {isEditing ? (
          <Box className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setIsEditing(false)}>
              Hủy
            </Button>
            <Button fullWidth onClick={handleSave}>
              Lưu thay đổi
            </Button>
          </Box>
        ) : isSubmitted ? (
          <Box className="flex gap-3">
            <Button
              className="bg-orange-500"
              fullWidth
              onClick={() => onApprove(task.id, 'rework')}
            >
              Yêu cầu làm lại
            </Button>
            <Button
              className="bg-green-500"
              fullWidth
              onClick={() => onApprove(task.id, 'completed')}
            >
              Duyệt hoàn thành
            </Button>
          </Box>
        ) : !isCompleted ? (
          <Button
            variant="secondary"
            className="text-red-500 border-red-200 bg-red-100"
            fullWidth
            onClick={() => onDelete(task.id)}
          >
            Xóa công việc
          </Button>
        ) : (
          <Button disabled fullWidth className="bg-gray-200 text-gray-500">
            Công việc đã đóng
          </Button>
        )}
      </Box>
    </Page>
  );
};

export default TaskDetailScreen;
