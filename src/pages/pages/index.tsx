import { Box, Page } from 'zmp-ui';
import Header from './header';
import { RollCall } from './rollcall';
import Statistical from './statistical';
import { SectionTitle } from '@/components/sectiontitle';
import Feature from './feature';
import History from './history';
import { useLocationCheck } from '../../hooks/useLocationCheck';
function HomePage() {
  const {
    loading: locationLoading,
    error: locationError,
    distance,
    checkLocation,
    MAX_DISTANCE,
  } = useLocationCheck();

  return (
    <Page className="flex flex-col space-y-6 pb-28 bg-cover bg-center bg-no-repeat dark:bg-black">
      <Header />

      <RollCall
        checkLocation={checkLocation}
        locationLoading={locationLoading}
        distance={distance}
        locationError={locationError}
        MAX_DISTANCE={MAX_DISTANCE}
      />

      <Box className="px-2 text-xl">
        <SectionTitle title="Thống kê hôm nay" />
      </Box>

      <Statistical
        distance={distance}
        locationError={locationError}
        locationLoading={locationLoading}
        MAX_DISTANCE={MAX_DISTANCE}
        checkLocation={checkLocation}
      />

      <Box className="px-2 text-xl">
        <SectionTitle title="Tính năng" />
      </Box>

      <Feature />

      <Box className="px-2 text-xl">
        <SectionTitle title="Lịch sử điểm danh" />
      </Box>

      <History />
    </Page>
  );
}

export default HomePage;
