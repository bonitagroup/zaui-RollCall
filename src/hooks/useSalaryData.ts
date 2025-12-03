import { useState, useEffect } from 'react';
import { useSetRecoilState, useRecoilValue } from 'recoil';
import { salaryListState, userState } from '@/states/state';
import api from '@/lib/api';

export const useSalaryData = () => {
  const user = useRecoilValue(userState);
  const setSalaryList = useSetRecoilState(salaryListState);

  const getInitialDate = () => {
    const now = new Date();
    const currentDay = now.getDate();
    let currentMonth = now.getMonth() + 1;
    let currentYear = now.getFullYear();

    if (currentDay < 5) {
      currentMonth -= 1;
      if (currentMonth === 0) {
        currentMonth = 12;
        currentYear -= 1;
      }
    }
    return { m: currentMonth, y: currentYear };
  };

  const initial = getInitialDate();
  const [month, setMonth] = useState(initial.m);
  const [year, setYear] = useState(initial.y);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSalary = async () => {
      if (!user?.zalo_id) return;
      setLoading(true);
      try {
        const res: any = await api.get('/admin/salary-stats', {
          params: { month, year, period: 'month', admin_zalo_id: user.zalo_id },
        });
        if (res.success && Array.isArray(res.data)) {
          setSalaryList(res.data);
        } else {
          setSalaryList([]);
        }
      } catch (e) {
        console.error(e);
        setSalaryList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSalary();
  }, [month, year, user?.zalo_id, setSalaryList]);

  return { month, setMonth, year, setYear, loading };
};
