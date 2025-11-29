import { Route, Routes, useLocation } from 'react-router';
import { Box } from 'zmp-ui';
import HomePage from '@/pages/pages/index';
import { Navigation } from './Navigation';
import AdminDashboard from '@/pages/admins/index';
import MyTasks from '@/pages/tasks/index';
import MyAttendanceHistory from '@/pages/attendanceHistory/MyAttendancePage';
import SalaryDetail from '@/pages/admins/salary/SalaryDetail';
import UserSalaryDetail from '@/pages/salaries/UserSalaryDetail';
import TaskSubmitDetail from '@/pages/tasks/TaskSubmitDetail';
import LeaveRequestScreen from '@/pages/pages/Leave';
import UserProfile from '@/pages/profiles/UserProfile';
import UserDetailAdmin from '@/pages/admins/management/UserDetailAdmin';

const Layout = () => {
  const location = useLocation();
  const hiddenNavigationPaths = [
    '/leave-request',
    '/salary-detail',
    '/user-salary-detail',
    '/task-submit-detail',
  ];
  const showNavigation = !hiddenNavigationPaths.includes(location.pathname);

  return (
    <div className="flex flex-col h-screen">
      <Box className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/my-tasks" element={<MyTasks />} />
          <Route path="/my-attendance" element={<MyAttendanceHistory />} />
          <Route path="/salary-detail" element={<SalaryDetail />} />
          <Route path="/user-salary-detail" element={<UserSalaryDetail />} />
          <Route path="/task-submit-detail" element={<TaskSubmitDetail />} />
          <Route path="/leave-request" element={<LeaveRequestScreen />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/admin/user-detail" element={<UserDetailAdmin />} />
        </Routes>
      </Box>
      {showNavigation && <Navigation />}
    </div>
  );
};

export default Layout;
