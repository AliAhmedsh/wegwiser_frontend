import { useState, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { VehicleListProps } from '../../types';
import UserInfoFull from './UserInfoFull';
import useUserStore from '@/entities/worker/api/mock/userStore';
import { useVehicle } from '@/lib/api/hooks/useVehicle';
import { useProductStore } from '@/entities/product/store';
import { WorkerListProps } from '@/entities/worker/type';

interface UserDetailModalProps {
  userID: string;
  vehicleID?: number | string | null;
  isOpen: boolean;
  onClose: () => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({
  userID,
  vehicleID,
  isOpen,
  onClose,
}) => {
  const { chosenProduct } = useProductStore();
  const { getUserByID, updateUser } = useUserStore();
  const [userData, setUserData] = useState<any>(null);
  const [hasMounted, setHasMounted] = useState(false);
  
  // Try to fetch vehicle data if vehicleID is provided
  const { data: vehicleData } = useVehicle(
    vehicleID ? parseInt(vehicleID.toString()) : 0
  );

  // Extract teamMembers from vehicle data and create workersData with capacity
  const workersData = useMemo(() => {
    const actualVehicle = vehicleData?.success ? vehicleData.vehicle : vehicleData;
    if (!actualVehicle?.teamMembers) return [];
    
    return ((actualVehicle as any).teamMembers || [])
      .filter((member: any) => member && member.id && member.name && member.email)
      .map((member: any) => {
        const roleToPosition = (role: string): string => {
          const roleLower = (role || '').toLowerCase();
          const isTeamLead = roleLower.includes('team lead');
          
          if (roleLower.includes('engineer') || roleLower.includes('qa')) {
            return isTeamLead ? 'ENGINEER/QA' : 'ENGINEER/QA'; // Keep same for filtering, but preserve in accuratePosition
          }
          if (roleLower.includes('ui') || roleLower.includes('ux') || roleLower.includes('designer')) {
            return 'UI/UX';
          }
          if (roleLower.includes('product') || roleLower.includes('manager') || roleLower.includes('pm')) {
            return 'PM';
          }
          return 'Member';
        };
        
        const position = roleToPosition(member.role || 'Member');
        
        const vehicleCount = (member as any).vehicleCount || 0;
        let filledLevels = (member as any).filledLevels;
        
        if (filledLevels === undefined || filledLevels === null) {
          filledLevels = Math.min(vehicleCount || 0, 5);
        }
        
        filledLevels = Math.max(0, Math.min(5, Number(filledLevels) || 0));
        
        const vehicles = (member as any).vehicles || [];
        const capacity = Array.from({ length: filledLevels }, (_, i) => {
          if (vehicles[i]) {
            return {
              id: vehicles[i].id,
              vehicleName: vehicles[i].name
            };
          }
          return {
            id: `vehicle-${i}`,
            vehicleName: `Vehicle ${i + 1}`
          };
        });

        const productInProgress = (member as any).productInProgress || 0;
        const userRole = (member as any).userRole || member.role || 'Member';
        const email = member.email || '';

        const nameParts = (member.name || '').split(' ').filter((n: string) => n);
        const firstName = nameParts[0] || '';
        const surname = nameParts.slice(1).join(' ') || '';
        const shortName = nameParts.map((n: string) => n[0]).join('.') || '';

        const roleLower = (member.role || '').toLowerCase();
        const isTeamLead = roleLower.includes('team lead');
        let teamLeadBorderColor: string | undefined = undefined;
        
        const isProductManager = (role: string) => {
          const r = role.toLowerCase();
          return r.includes('product_manager') || 
                 r.includes('product manager') || 
                 r.includes('pm') || 
                 (r.includes('product') && r.includes('manager'));
        };
        
        if (isTeamLead) {
          if (roleLower.includes('designer')) {
            teamLeadBorderColor = '#8AD5E7'; // Designer lead - light blue
          } else if (isProductManager(roleLower)) {
            teamLeadBorderColor = '#E182B5'; // PM lead - pink
          } else if (roleLower.includes('engineer') || roleLower.includes('qa')) {
            teamLeadBorderColor = '#000000'; // Engineer lead - black
          }
        }

        return {
          id: member.id?.toString() || '',
          name: member.name || firstName,
          surname: surname,
          email: email,
          position: position,
          capacity: capacity,
          status: 'active' as const,
          productInProgress: productInProgress,
          vehicleInProgress: vehicleCount,
          relatedVehicles: [],
          facilitatorIn: [],
          efficiencyCharts: {
            speed: 75,
            efficiency: 80,
            quality: 85,
          },
          relatedProducts: [],
          image: '/Ellipse 5.svg',
          accuratePosition: member.role || userRole || 'Member', // Use member.role from backend which includes Team Lead
          isTeamLead: isTeamLead,
          teamLeadBorderColor: teamLeadBorderColor,
          shortName: shortName,
          color: '#33A1FD',
          isManager: false,
          password: '',
          timeZone: 'UTC+0',
          phoneNumber: '+1-555-0000'
        } as WorkerListProps;
      });
  }, [vehicleData]);

  // Sync workers data to store when it changes, especially for the current user
  useEffect(() => {
    workersData.forEach((worker) => {
      updateUser(worker.id, {
        capacity: worker.capacity,
        vehicleInProgress: worker.vehicleInProgress,
        productInProgress: worker.productInProgress,
        name: worker.name,
        surname: worker.surname,
        email: worker.email,
        accuratePosition: worker.accuratePosition,
        shortName: worker.shortName
      });
    });
  }, [workersData, updateUser]);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && userID) {
      // First try to get user from store (which might have been updated by workersData)
      let user = getUserByID(userID);
      
      // If not found in store, try to find in workersData
      if (!user && workersData.length > 0) {
        user = workersData.find((w) => w.id === userID || w.id?.toString() === userID?.toString());
      }
      
      // If user found in workersData, update store to ensure capacity is available
      if (user && workersData.length > 0) {
        const workerFromData = workersData.find((w) => w.id === userID || w.id?.toString() === userID?.toString());
        if (workerFromData && workerFromData.capacity) {
          // Update store with capacity from workersData
          updateUser(userID, {
            capacity: workerFromData.capacity,
            vehicleInProgress: workerFromData.vehicleInProgress,
            productInProgress: workerFromData.productInProgress,
          });
          user = workerFromData;
        }
      }
      
      setUserData(user);
    }
  }, [isOpen, userID, getUserByID, workersData, updateUser]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!hasMounted || !isOpen || !userData) {
    return null;
  }

  // Create default vehicle data if not available
  const defaultVehicleData: VehicleListProps = {
    id: 0,
    productId: chosenProduct?.id || 0,
    composite: 0,
    vehicleInfo: {
      name: 'User Profile',
      Description: '',
    },
    size: 'medium',
    relatedProducts: chosenProduct ? [chosenProduct.id.toString()] : [],
  };

  // vehicleData structure: { success: true, vehicle: {...} } or just vehicle object
  const actualVehicle = vehicleData?.success ? vehicleData.vehicle : vehicleData;
  
  let finalVehicleData: VehicleListProps = defaultVehicleData;
  
  if (actualVehicle) {
    // Transform vehicle data to VehicleListProps format
    finalVehicleData = {
      id: (actualVehicle as any).id || 0,
      productId: (actualVehicle as any).productId || chosenProduct?.id || 0,
      composite: (actualVehicle as any).composite || 0,
      size: (actualVehicle as any).size || 'medium',
      vehicleInfo: {
        name: (actualVehicle as any).vehicleInfo?.name || (actualVehicle as any).name || 'User Profile',
        Description: (actualVehicle as any).vehicleInfo?.Description || (actualVehicle as any).description || '',
      },
      relatedProducts: chosenProduct ? [chosenProduct.id.toString()] : [],
    };
  }

  return ReactDOM.createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-transparent"
      onClick={onClose}
    >
      <div
        className="h-[85%] overflow-hidden min-w-[80%] max-w-[90%] border top-1/2 mt-[-20px] bg-[#EAEDF2] rounded-4xl flex justify-between p-8 pb-14"
        style={{ boxShadow: '0px 2px 4px 0px #A7B1C499' }}
        onClick={(e) => e.stopPropagation()}
      >
        <UserInfoFull
          setIsShowUserInfo={onClose}
          userID={userID}
          vehicleData={finalVehicleData}
          isOpen={isOpen}
          workersData={workersData}
        />
      </div>
    </div>,
    document.body
  );
};

export default UserDetailModal;

