import React, { useRef } from 'react';
import { App, ZMPRouter } from 'zmp-ui';
import { SnackbarProvider } from 'zmp-ui';
import { RecoilRoot, useRecoilValue } from 'recoil';
import Layout from './layout';
import { attendanceLoadingState, userLoadingState } from '@/states/state';
import { useUserInit } from '@/hooks/useUserInit';
import { useAttendanceInit } from '@/hooks/useAttendanceInit';

const MyApp = () => {
  const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    useUserInit();
    useAttendanceInit();

    const userLoading = useRecoilValue(userLoadingState);
    const attendanceLoading = useRecoilValue(attendanceLoadingState);

    const initialLoadDoneRef = useRef(false);

    if (!userLoading && !attendanceLoading && !initialLoadDoneRef.current) {
      initialLoadDoneRef.current = true;
    }

    if ((userLoading || attendanceLoading) && !initialLoadDoneRef.current) {
      return (
        <div className="flex justify-center items-center h-screen">
          <p className="text-gray-500">Đang tải dữ liệu...</p>
        </div>
      );
    }

    return <>{children}</>;
  };

  const ZMPSnackbarProvider = SnackbarProvider as any;

  return (
    <RecoilRoot>
      <App>
        <ZMPSnackbarProvider>
          <AppInitializer>
            <ZMPRouter>
              <Layout />
            </ZMPRouter>
          </AppInitializer>
        </ZMPSnackbarProvider>
      </App>
    </RecoilRoot>
  );
};

export default MyApp;
