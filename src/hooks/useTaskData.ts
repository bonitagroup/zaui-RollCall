import { useState, useCallback, useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { tasksState, userState } from '@/states/state';
import api from '@/lib/api';

export const useTaskData = (isMyTask = true) => {
  const user = useRecoilValue(userState);
  const setTasks = useSetRecoilState(tasksState);
  const [loading, setLoading] = useState(false);

  const fetchTasks = useCallback(
    async (customZaloId?: string) => {
      const zaloId = customZaloId || user?.zalo_id;
      if (!zaloId) return;

      setLoading(true);
      try {
        const params: any = {};
        if (isMyTask) {
          params.zalo_id = zaloId;
          params.type = 'my_tasks';
        } else {
          params.zalo_id = zaloId;
        }

        const res: any = await api.get('/admin/task/list', { params });
        if (res.success) {
          setTasks(res.data);
        } else {
          setTasks([]);
        }
      } catch (e) {
        console.error(e);
        setTasks([]);
      } finally {
        setLoading(false);
      }
    },
    [user?.zalo_id, isMyTask, setTasks]
  );

  useEffect(() => {
    if (isMyTask && user?.zalo_id) {
      fetchTasks();
    }
  }, [isMyTask, user?.zalo_id]);

  return { loading, fetchTasks };
};
