import { useState } from 'react';
import { getLocation, getAccessToken } from 'zmp-sdk/apis';
import api from '../lib/api';

interface CheckLocationResponse {
  success: boolean;
  error?: string;
  message?: string;
  distance?: number;
  data?: {
    distance: number;
  };
}

export const useLocationCheck = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [distance, setDistance] = useState<number | null>(null);

  const checkLocation = async (): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setDistance(null);

    try {
      const { token } = await getLocation({
        fail: (err) => {
          throw new Error(`Zalo: ${err.message || 'Không lấy được vị trí GPS.'}`);
        },
      });

      const accessToken = await getAccessToken({
        fail: (err) => {
          throw new Error(`Zalo: ${err.message || 'Lỗi xác thực người dùng.'}`);
        },
      });

      const res: CheckLocationResponse = await api.post('/location/convert-token', {
        token: token,
        accessToken: accessToken,
      });

      if (!res || !res.success) {
        if (typeof res.distance === 'number') {
          setDistance(res.distance);
        } else if (res.data && typeof res.data.distance === 'number') {
          setDistance(res.data.distance);
        }

        throw new Error(res.error || 'Vị trí không hợp lệ.');
      }

      if (res.data && typeof res.data.distance === 'number') {
        setDistance(res.data.distance);
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('Check location failed:', err);
      setError(err.message);
      setLoading(false);
      return false;
    }
  };

  return {
    loading,
    error,
    distance,
    checkLocation,
  };
};
