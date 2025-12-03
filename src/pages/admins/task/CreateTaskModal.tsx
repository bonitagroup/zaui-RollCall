import React, { useState, useEffect } from 'react';
import { Modal, Box, Input, Button, Text } from 'zmp-ui';

interface CreateTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; description: string; due_date: Date }) => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ visible, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: new Date(),
  });

  useEffect(() => {
    if (visible) {
      setFormData({
        title: '',
        description: '',
        due_date: new Date(),
      });
    }
  }, [visible]);

  const formatDateTimeForInput = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    const localISOTime = new Date(date.getTime() - offset).toISOString().slice(0, 16);
    return localISOTime;
  };

  const handleSubmit = () => {
    if (!formData.title) {
      alert('Vui lòng nhập tên công việc');
      return;
    }
    onSubmit(formData);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Giao việc mới">
      <Box className="space-y-4 p-4">
        <Input
          label="Tên công việc"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Ví dụ: Báo cáo doanh thu..."
        />

        <Input.TextArea
          label="Chi tiết"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Mô tả chi tiết công việc..."
          showCount
          maxLength={1000}
          rows={4}
        />

        <Box>
          <Text size="small" className="text-gray-500 mb-1 ml-1 font-medium">
            Hạn hoàn thành
          </Text>
          <input
            type="datetime-local"
            className="w-full h-11 px-3 rounded-lg border border-[#e5e7eb] text-base bg-white outline-none focus:border-blue-500 transition-colors text-gray-800 font-medium"
            value={formatDateTimeForInput(formData.due_date)}
            onChange={(e) => {
              if (e.target.value) {
                setFormData({ ...formData, due_date: new Date(e.target.value) });
              }
            }}
          />
        </Box>

        <Button fullWidth onClick={handleSubmit} className="bg-blue-600">
          Giao việc ngay
        </Button>
      </Box>
    </Modal>
  );
};

export default CreateTaskModal;
