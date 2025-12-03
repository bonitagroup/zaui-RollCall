import React, { useState, useCallback, useMemo, useRef } from 'react';
import { Page, Box, Text, Icon, Button, Input, Slider, useSnackbar, ImageViewer } from 'zmp-ui';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/api';
import MultiImagePicker from './MultiImagePicker';

const TaskSubmitDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { openSnackbar } = useSnackbar();

  const taskRef = useRef<any>(null);
  if (!taskRef.current) {
    taskRef.current = location.state?.task || null;
  }
  const task = taskRef.current;

  const [report, setReport] = useState(() => task?.report_content || '');
  const [progress, setProgress] = useState(() => task?.progress || 0);
  const [images, setImages] = useState<string[]>(() => {
    if (!task?.report_image) return [];
    try {
      const parsed = JSON.parse(task.report_image);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const imageViewerImages = useMemo(() => images.map((src) => ({ src })), [images]);

  const handleImageClick = useCallback((idx: number) => {
    setActiveIndex(idx);
    setVisible(true);
  }, []);

  const handleSliderChange = useCallback((val: any) => {
    if (typeof val === 'number') setProgress(val);
  }, []);

  const handleReportChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setReport(e.target.value);
  }, []);

  const handleSubmit = useCallback(
    async (isSubmit = false) => {
      if (isSubmit && images.length === 0) {
        openSnackbar({ text: 'Vui lòng chọn ảnh minh chứng!', type: 'warning' });
        return;
      }

      setLoading(true);
      try {
        await api.put('/admin/task/update', {
          id: task.id,
          status: isSubmit ? 'submitted' : task.status,
          report_content: report,
          report_image: JSON.stringify(images),
          progress,
        });
        openSnackbar({
          text: isSubmit ? 'Thành công!' : 'Đã lưu nháp!',
          type: 'success',
        });
      } catch {
        openSnackbar({ text: 'Lỗi cập nhật', type: 'error' });
      } finally {
        setLoading(false);
      }
    },
    [images, report, progress, task.id, openSnackbar]
  );

  if (!task) {
    return <div className="p-10 text-center">Không có dữ liệu task. Vui lòng quay lại.</div>;
  }

  const isReadOnly = task.status === 'completed' || task.status === 'submitted';

  return (
    <Page className="bg-white min-h-screen flex flex-col">
      <ImageViewer
        onClose={() => setVisible(false)}
        activeIndex={activeIndex}
        images={imageViewerImages}
        visible={visible}
      />

      <Box className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 px-4 py-4 pt-12 flex items-center sticky top-0 z-50 shadow-md">
        <Box onClick={() => navigate(-1)} className="mr-3 active:opacity-50 cursor-pointer">
          <Icon icon="zi-arrow-left" className="text-white text-2xl" />
        </Box>
        <Text className="text-white font-bold text-xl">Chi tiết công việc</Text>
      </Box>

      <Box className="flex-1 p-5 overflow-y-auto pb-24">
        <Box className="mb-6">
          <Text className="text-xl font-bold mb-2 text-gray-800">{task.title}</Text>
          <Text className="text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 whitespace-pre-wrap">
            {task.description}
          </Text>
        </Box>

        <Box className="border-t pt-4">
          <Text className="text-lg font-bold mb-4 text-blue-600">Báo cáo thực hiện</Text>
          <Box className="mb-6">
            <Box className="flex justify-between mb-2">
              <Text className="font-bold text-sm text-gray-600">Tiến độ</Text>
              <Text className="font-bold text-blue-600">{progress}%</Text>
            </Box>
            <Slider min={0} max={100} value={progress} onChange={handleSliderChange} />
          </Box>

          <Input.TextArea
            label="Nội dung báo cáo"
            placeholder="Nhập nội dung..."
            value={report}
            onChange={handleReportChange}
            rows={4}
            className="mb-4"
            disabled={isReadOnly}
            showCount
            maxLength={1000}
          />

          {!isReadOnly ? (
            <MultiImagePicker
              label="Ảnh minh chứng"
              images={images}
              onChange={setImages}
              onImageClick={handleImageClick}
            />
          ) : (
            <Box>
              <Text className="mb-2 font-bold text-sm text-gray-600">Ảnh minh chứng</Text>
              <Box className="grid grid-cols-3 gap-2">
                {images.map((url, idx) => (
                  <img
                    key={idx}
                    className="rounded-lg w-full aspect-square object-cover border border-gray-200 cursor-pointer"
                    onClick={() => handleImageClick(idx)}
                    src={url}
                    alt="evidence"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {!isReadOnly && (
        <Box className="p-4 border-t bg-white fixed bottom-0 w-full flex gap-3 shadow-top z-40">
          <Button
            variant="secondary"
            fullWidth
            onClick={() => handleSubmit(false)}
            loading={loading}
          >
            Lưu nháp
          </Button>
          <Button
            fullWidth
            onClick={() => handleSubmit(true)}
            loading={loading}
            disabled={images.length === 0 || progress === 0}
          >
            Nộp
          </Button>
        </Box>
      )}
    </Page>
  );
};

export default TaskSubmitDetail;
