import React, { useCallback } from 'react';
import { Box, Text, Icon } from 'zmp-ui';
import { openMediaPicker } from 'zmp-sdk/apis';

const API_DOMAIN = import.meta.env.VITE_API_URL;
const UPLOAD_API_URL = `${API_DOMAIN}/api/upload/media`;

export const getThumbnailUrl = (url: string) => {
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return url.replace('/upload/', '/upload/w_300,h_300,c_fill,q_auto,f_auto/');
  }
  return url;
};

interface MultiImagePickerProps {
  label?: string;
  images: string[];
  onChange: (images: string[]) => void;
  onImageClick: (index: number) => void;
}

const MultiImagePicker: React.FC<MultiImagePickerProps> = ({
  label = 'Ảnh minh chứng',
  images,
  onChange,
  onImageClick,
}) => {
  const handleChooseImage = useCallback(async () => {
    if (images.length >= 5) return;

    try {
      await openMediaPicker({
        type: 'photo',
        serverUploadUrl: UPLOAD_API_URL,
        maxSelectItem: 5 - images.length,
        success: (res) => {
          try {
            const response = JSON.parse(res.data);
            if (response.error === 0 && response.data?.urls) {
              onChange([...images, ...response.data.urls]);
            }
          } catch {
            // Silent fail
          }
        },
        fail: () => {
          // User cancelled or error
        },
      });
    } catch {
      // API error
    }
  }, [images, onChange]);

  const handleRemoveImage = useCallback(
    (index: number) => {
      onChange(images.filter((_, i) => i !== index));
    },
    [images, onChange]
  );

  const handleImageClick = useCallback(
    (index: number) => {
      onImageClick(index);
    },
    [onImageClick]
  );

  return (
    <Box className="mb-4">
      <Text className="mb-2 font-bold text-sm text-gray-600">{label}</Text>
      <Box className="grid grid-cols-3 gap-3">
        {images.map((url, index) => (
          <Box
            key={index}
            className="relative aspect-square cursor-pointer"
            onClick={() => handleImageClick(index)}
          >
            <img
              src={getThumbnailUrl(url)}
              className="w-full h-full object-cover rounded-lg border border-gray-200"
              alt="preview"
            />
            <div
              onClick={(e) => {
                e.stopPropagation();
                handleRemoveImage(index);
              }}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md z-10 cursor-pointer hover:bg-red-600"
            >
              <Icon icon="zi-close" size={12} />
            </div>
          </Box>
        ))}

        {images.length < 5 && (
          <Box
            className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 active:bg-gray-100"
            onClick={handleChooseImage}
          >
            <Icon icon="zi-plus" className="text-gray-400 text-2xl" />
            <Text size="xSmall" className="text-gray-400 mt-1">
              Thêm
            </Text>
          </Box>
        )}
      </Box>
      <Text size="small" className="text-gray-500 mt-2 text-right">
        {images.length}/5 ảnh
      </Text>
    </Box>
  );
};

export default React.memo(MultiImagePicker);
