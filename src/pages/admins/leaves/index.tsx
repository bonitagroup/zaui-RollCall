import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import LeaveMenu from './LeaveMenu';
import LeaveList from './LeaveList';

interface LeaveManagementProps {
  onBack: () => void;
}

const LeaveManagement: React.FC<LeaveManagementProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = useState<'menu' | 'pending' | 'history'>('menu');

  const [pendingCount, setPendingCount] = useState(0);

  const fetchCount = async () => {
    try {
      const res: any = await api.get('/leave-requests/list');
      if (res.success && Array.isArray(res.data)) {
        const count = res.data.filter((r: any) => r.status === 'pending').length;
        setPendingCount(count);
      }
    } catch (error) {
      console.error('Lỗi lấy số lượng đơn:', error);
    }
  };

  useEffect(() => {
    if (currentView === 'menu') {
      fetchCount();
    }
  }, [currentView]);

  if (currentView === 'menu') {
    return (
      <LeaveMenu
        onBack={onBack}
        onSelectOption={(option) => setCurrentView(option)}
        pendingCount={pendingCount}
      />
    );
  }

  return <LeaveList viewMode={currentView} onBack={() => setCurrentView('menu')} />;
};

export default LeaveManagement;
