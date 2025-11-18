import { useState } from 'react';
import { getLocation, getAccessToken } from 'zmp-sdk/apis';
import api from '../lib/api';

const REFERENCE_LAT = 21.5863937;
const REFERENCE_LON = 105.8424984;
const MAX_DISTANCE = 20;

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

function getDistanceM(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
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
          throw new Error(`Zalo: ${err.message || 'Không lấy được vị trí.'}`);
        },
      });
      const accessToken = await getAccessToken({
        fail: (err) => {
          throw new Error(`Zalo: ${err.message || 'Không lấy được xác thực.'}`);
        },
      });

      const data: ApiResponse = await api.post('/location/convert-token', {
        token: token,
        accessToken: accessToken,
      });

      if (!data || !data.success) {
        throw new Error(data.error || 'Lỗi server khi chuyển đổi token');
      }

      const { latitude, longitude } = data.data;
      const latNum = parseFloat(latitude);
      const lonNum = parseFloat(longitude);

      const dist = getDistanceM(latNum, lonNum, REFERENCE_LAT, REFERENCE_LON);
      setDistance(dist);

      if (dist > MAX_DISTANCE) {
        throw new Error(`Vị trí quá xa (${dist.toFixed(0)}m). Chỉ chấp nhận <= ${MAX_DISTANCE}m.`);
      }

      setLoading(false);
      return true;
    } catch (err: any) {
      console.error('checkLocation error:', err);
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
    MAX_DISTANCE,
  };
};
