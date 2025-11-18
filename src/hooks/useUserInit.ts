import { useEffect, useCallback } from 'react';
import { useSetRecoilState } from 'recoil';
import { userState, userLoadingState } from '@/states/state';
import { getUserInfo } from 'zmp-sdk';
import { events, EventName } from 'zmp-sdk/apis';

import api from '@/lib/api';
import { User } from '@/types/users';

const saveUserToBackend = async (profile: any): Promise<User | null> => {
  if (!profile?.id) return null;
  try {
    const res: any = await api.post('/user/profile', {
      zalo_id: String(profile.id),
      name: profile.name,
      avatar_url: profile.avatar,
    });
    return res?.data ?? null;
  } catch (e) {
    return null;
  }
};

export const useUserInit = () => {
  const setUser = useSetRecoilState(userState);
  const setLoading = useSetRecoilState(userLoadingState);

  const initializeUser = useCallback(
    async (isInitialLoad = false) => {
      try {
        if (isInitialLoad) {
          setLoading(true);
        }

        const { userInfo } = await getUserInfo({
          autoRequestPermission: true,
          avatarType: 'normal',
        });

        if (userInfo) {
          const userFromBackend = await saveUserToBackend(userInfo);
          setUser(userFromBackend);
        }
      } finally {
        if (isInitialLoad) {
          setLoading(false);
        }
      }
    },
    [setUser, setLoading]
  );

  useEffect(() => {
    initializeUser(true);
    const onAppResume = () => {
      initializeUser(false);
    };

    events.on(EventName.AppResumed, onAppResume);
    events.on(EventName.OpenApp, onAppResume);

    return () => {
      events.off(EventName.AppResumed, onAppResume);
      events.off(EventName.OpenApp, onAppResume);
    };
  }, [initializeUser]);
};
