import { Route, Routes } from 'react-router';
import { Box } from 'zmp-ui';
import HomePage from '@/pages/pages/index';
import { Navigation } from './Navigation';
import AdminDashboard from '@/pages/admins/index';

const Layout = () => {
  return (
    <div className="flex flex-col h-screen">
      <Box className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
        </Routes>
      </Box>
      <Navigation />
    </div>
  );
};

export default Layout;
