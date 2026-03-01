import CapacityCard from './CapacityCard';
import PerformanceChart from './PerformanceCard';
import UserInfo from './UserInfo';
import EfficiencyCard from '../shared/EffiecincyCard';
import { WorkerListProps } from '@/entities/worker/type';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import useUserStore from '@/entities/worker/api/mock/userStore';
import { VehicleListProps } from '../../types';
import { useProductStore } from '@/entities/product/store';
import { usePersonalAnalytics } from '@/hooks/usePersonalAnalytics';
import { useUserAnalytics } from '@/hooks/useUserAnalytics';

interface UserInfoFullProps {
  setIsShowUserInfo: Dispatch<SetStateAction<boolean>>;
  userID: string;
  vehicleData: VehicleListProps;
  isOpen?: boolean;
  workersData?: WorkerListProps[];
}

const UserInfoFull: React.FC<UserInfoFullProps> = ({
  userID,
  setIsShowUserInfo,
  vehicleData,
  isOpen = true,
  workersData,
}) => {
  const { getUserByID } = useUserStore();
  const { chosenProduct } = useProductStore();
  const [userData, setUserData] = useState<WorkerListProps>();

  const productId = chosenProduct?.id || vehicleData.productId || undefined;

  // Fetch user-specific analytics for the user being viewed
  const { data: userAnalyticsData, isLoading: userAnalyticsLoading } = useUserAnalytics(
    isOpen ? userID : null,
    productId || undefined
  );

  // Fallback to personal analytics if user analytics not available
  const { data: efficiencyData, isLoading: efficiencyLoading } = usePersonalAnalytics(
    isOpen && productId && !userAnalyticsData ? productId : null
  );

  useEffect(() => {
    // First try to get user from store
    let user = getUserByID(userID);
    
    // If not found in store, try to find in workersData
    if (!user && workersData) {
      user = workersData.find((w) => w.id === userID);
    }
    
    // If still not found and workersData exists, try to find by string comparison
    if (!user && workersData) {
      user = workersData.find((w) => w.id?.toString() === userID?.toString());
    }
    
    setUserData(user);
  }, [userID, getUserByID, workersData]);

  if (!userData) {
    return <>Downloading</>;
  }

  // Use user-specific analytics if available, otherwise fallback to personal analytics or store data
  const efficiencyCharts = userAnalyticsData?.performance || efficiencyData?.performance || userData.efficiencyCharts || {
    speed: 0,
    efficiency: 0,
    quality: 0,
  };

  return (
    <div className="flex w-full">
      <div className="w-[40%] mr-5">
        <UserInfo
          workerData={userData}
          vehicleName={vehicleData.vehicleInfo.name}
          setIsShowUser={setIsShowUserInfo}
        />
      </div>
      <div className="w-[60%]">
        <EfficiencyCard {...efficiencyCharts} />
        <CapacityCard
          vehicleName={vehicleData.vehicleInfo.name}
          userID={userID}
          capacity={userData?.capacity}
        />
        <PerformanceChart userId={userID} productId={productId} vehicleId={vehicleData.id} enabled={isOpen} />
      </div>
    </div>
  );
};

export default UserInfoFull;
