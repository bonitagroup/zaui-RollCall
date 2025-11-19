import Box from 'zmp-ui/box';
import DateDisplay from '@/components/display/date';
import { useRecoilValue } from 'recoil';
import { userState } from '@/states/state';

const Header = (): JSX.Element => {
  const user = useRecoilValue(userState);

  return (
    <Box className="bg-[#0188FE] dark:bg-black w-full rounded-b-2xl shadow-2xl pt-14">
      <Box className="p-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-white object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center text-white">
                  ?
                </div>
              )}
              <div className="text-left ml-2">
                <p className="text-xs">
                  Xin chào,&nbsp;
                  <span className="font-semibold text-yellow-300">{user.name}</span>
                </p>
                <p className="text-xs opacity-90">
                  Chức vụ: <span className="font-semibold">{user.role ?? 'Chưa có chức vụ'}</span>
                </p>
              </div>
            </>
          ) : (
            <div>
              <div className="font-semibold">Không tìm thấy user</div>
              <div className="text-sm opacity-90">Vui lòng cấp quyền để sử dụng app</div>
            </div>
          )}
        </div>
      </Box>

      <Box className="pb-3 px-3 text-white text-center pt-2">
        <DateDisplay />
      </Box>
    </Box>
  );
};

export default Header;
