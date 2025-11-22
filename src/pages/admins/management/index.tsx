import { useState, useEffect } from 'react';
import { Box, Text, Icon, Page } from 'zmp-ui';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { userState, allUsersState, splitUsersState } from '@/states/state';
import api from '@/lib/api';
import { AdminHeader } from './header';
import { AdminStats } from './start';
import { UserRow } from './UserRow';
import { SectionTitle } from '@/components/sectiontitle';

interface PersonnelManagementProps {
  onBack: () => void;
}

const PersonnelManagement: React.FC<PersonnelManagementProps> = ({ onBack }) => {
  const admin = useRecoilValue(userState);
  const setAllUsers = useSetRecoilState(allUsersState);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('assigned');

  const roles = [
    'admin',
    'Nhân viên kinh doanh',
    'Marketing',
    'Kỹ thuật',
    'Thiết kế',
    'Quản lý',
    'Nhân sự',
    'Kế toán',
    'người dùng mới',
  ];

  useEffect(() => {
    const fetchUsers = async () => {
      if (!admin || !admin.zalo_id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const res: any = await api.get('/admin/users', {
          params: { admin_zalo_id: admin.zalo_id },
        });
        if (res.success && Array.isArray(res.data)) {
          setAllUsers(res.data);
        } else {
          throw new Error(res.error || 'Failed to fetch users');
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [admin, setAllUsers]);

  const { assignedUsers, unassignedUsers } = useRecoilValue(splitUsersState);

  if (!admin) return null;

  return (
    <Page className="flex-1 bg-gray-50 flex flex-col min-h-screen">
      <Box className="bg-blue-600 px-4 py-4 pt-12 shadow-sm sticky top-0 z-50">
        <Box className="flex items-center space-x-3">
          <Box onClick={onBack} className="active:opacity-50 transition-opacity cursor-pointer">
            <Icon icon="zi-arrow-left" className="text-white text-2xl" />
          </Box>
          <Text className="text-white font-bold text-xl">Quản lý nhân sự</Text>
        </Box>
      </Box>

      <Box className="bg-white shadow-sm pb-4">
        <AdminHeader />
        <Box className="px-4 mt-4">
          <SectionTitle title="Thống kê nhanh" />
        </Box>
        <AdminStats />
      </Box>

      {loading && (
        <Box className="flex items-center justify-center py-8">
          <Box className="text-center">
            <Text className="text-gray-500 mb-2">Đang tải danh sách...</Text>
            <Box className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></Box>
          </Box>
        </Box>
      )}

      {error && (
        <Box className="mx-4 my-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <Text className="text-red-600 text-center">Lỗi: {error}</Text>
        </Box>
      )}

      {!loading && !error && (
        <Box className="flex-1">
          <Box className="bg-white border-b border-gray-200 sticky top-[130px] z-40 px-4 py-3">
            <Box className="flex max-w-md mx-auto bg-gray-100 rounded-2xl p-1.5 shadow-inner">
              <Box
                onClick={() => setActiveTab('assigned')}
                className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeTab === 'assigned'
                    ? 'bg-white shadow-lg transform scale-[1.02]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <Box className="flex items-center justify-center space-x-2">
                  <Box
                    className={`w-2 h-2 rounded-full ${
                      activeTab === 'assigned' ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                  />
                  <Text
                    className={`font-bold text-sm ${
                      activeTab === 'assigned' ? 'text-blue-600' : 'text-gray-600'
                    }`}
                  >
                    Nhân viên
                  </Text>
                </Box>
                <Box
                  className={`mt-1 px-2 py-1 rounded-full ${
                    activeTab === 'assigned' ? 'bg-blue-50' : 'bg-gray-200'
                  } transition-colors`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      activeTab === 'assigned' ? 'text-blue-600' : 'text-gray-500'
                    }`}
                  >
                    {assignedUsers.length} người
                  </Text>
                </Box>
              </Box>

              <Box
                onClick={() => setActiveTab('unassigned')}
                className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeTab === 'unassigned'
                    ? 'bg-white shadow-lg transform scale-[1.02]'
                    : 'hover:bg-gray-50'
                }`}
              >
                <Box className="flex items-center justify-center space-x-2">
                  <Box
                    className={`w-2 h-2 rounded-full ${
                      activeTab === 'unassigned' ? 'bg-green-500' : 'bg-gray-400'
                    }`}
                  />
                  <Text
                    className={`font-bold text-sm ${
                      activeTab === 'unassigned' ? 'text-green-600' : 'text-gray-600'
                    }`}
                  >
                    Người dùng mới
                  </Text>
                </Box>
                <Box
                  className={`mt-1 px-2 py-1 rounded-full ${
                    activeTab === 'unassigned' ? 'bg-green-50' : 'bg-gray-200'
                  } transition-colors`}
                >
                  <Text
                    className={`text-xs font-semibold ${
                      activeTab === 'unassigned' ? 'text-green-600' : 'text-gray-500'
                    }`}
                  >
                    {unassignedUsers.length} người
                  </Text>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box className="p-4">
            {activeTab === 'assigned' && (
              <Box className="space-y-3">
                {assignedUsers.length === 0 ? (
                  <Box className="text-center py-12">
                    <Box className="w-20 h-20 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Text className="text-3xl">👥</Text>
                    </Box>
                    <Text className="text-gray-600 text-lg font-bold mb-2">
                      Không có nhân viên nào
                    </Text>
                  </Box>
                ) : (
                  <Box className="space-y-3">
                    <Box className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      {assignedUsers
                        .filter((user) => user.zalo_id)
                        .map((user) => (
                          <UserRow key={user.zalo_id} user={user} roles={roles} />
                        ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}

            {activeTab === 'unassigned' && (
              <Box className="space-y-3">
                {unassignedUsers.length === 0 ? (
                  <Box className="text-center py-12">
                    <Box className="w-20 h-20 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                      <Text className="text-3xl">✨</Text>
                    </Box>
                    <Text className="text-gray-600 text-lg font-bold mb-2">
                      Không có người dùng mới
                    </Text>
                  </Box>
                ) : (
                  <Box className="space-y-3">
                    <Box className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      {unassignedUsers
                        .filter((user) => user.zalo_id)
                        .map((user) => (
                          <UserRow key={user.zalo_id} user={user} roles={roles} />
                        ))}
                    </Box>
                  </Box>
                )}
              </Box>
            )}
          </Box>
        </Box>
      )}
    </Page>
  );
};

export default PersonnelManagement;
