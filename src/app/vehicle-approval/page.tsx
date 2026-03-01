'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import VehicleSimulation from '@/entities/vehicle/vehicleSimulating';
import { vehicleService } from '@/lib/api/services/vehicleService';
import { fastApiService } from '@/lib/api/services/fastApiService';
import { useProductStore } from '@/entities/product/store';
import Loader from '@/shared/ui/Loader';
import { showToast } from '@/lib/utils/toast';
import { messagingApi } from '@/entities/messaging/api/messagingApi';

export default function VehicleApprovalPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const vehicleId = searchParams.get('vehicleId');
  const productId = searchParams.get('productId');
  const { chosenProduct, setChosenProduct } = useProductStore();

  const [vehicleData, setVehicleData] = useState<any>(null);
  const [impactAnalysisData, setImpactAnalysisData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSimulation, setShowSimulation] = useState(false);
  const [autoOpenSimulation, setAutoOpenSimulation] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  
  // Get current user ID from API (database ID, not Auth0 sub)
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const user = await messagingApi.getCurrentUser();
        if (user?.id) {
          setCurrentUserId(user.id);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };
    
    if (typeof window !== 'undefined') {
      fetchCurrentUser();
    }
  }, []);
  
  // Check if current user has already approved
  const currentUserMembership = vehicleData?.members?.find(
    (m: any) => {
      if (!currentUserId) return false;
      const memberUserId = m.user?.id || m.userId;
      return memberUserId === currentUserId || memberUserId === Number(currentUserId);
    }
  );
  
  const hasApproved = currentUserMembership?.approvalStatus?.toLowerCase() === 'approved';
  
  // Check if current user is an approver (Team Lead roles, Product Manager, Owner)
  const isApprover = currentUserMembership ? (() => {
    const role = (currentUserMembership.role || '').toLowerCase();
    return role.includes('team lead') || 
           role.includes('product manager') || 
           role.includes('approver') ||
           role.includes('owner') ||
           (role.includes('pm') && role.includes('lead'));
  })() : false;

  // Check for autoOpenSimulation flag on mount and from sessionStorage
  useEffect(() => {
    // Check URL params first
    const autoOpenFromUrl = searchParams.get('autoOpenSimulation') === 'true';
    
    if (autoOpenFromUrl) {
      console.log('✅ Auto-open flag found in URL params');
      setAutoOpenSimulation(true);
    } else {
      // Check sessionStorage
      const approverParamsStr = sessionStorage.getItem('approverParams');
      if (approverParamsStr) {
        try {
          const approverParams = JSON.parse(approverParamsStr);
          if (approverParams.autoOpenSimulation === 'true') {
            console.log('✅ Auto-open flag found in sessionStorage');
            setAutoOpenSimulation(true);
            // Clear sessionStorage after reading
            sessionStorage.removeItem('approverParams');
          }
        } catch (error) {
          console.error('Error parsing approver params:', error);
        }
      }
    }
  }, [searchParams]);

  // Handle facilitator invitation acceptance on vehicle-approval page
  useEffect(() => {
    const handleFacilitatorInvitation = async () => {
      // Check if user is already logged in
      if (!currentUserId) {
        console.log('⏳ [Vehicle Approval] Waiting for currentUserId...');
        return;
      }

      // First check sessionStorage for facilitator invitation params
      let facilitatorParams: any = null;
      const sessionStorageParams = sessionStorage.getItem('facilitatorInvitationParams');
      if (sessionStorageParams) {
        try {
          facilitatorParams = JSON.parse(sessionStorageParams);
          console.log('📧 [Vehicle Approval] Found facilitator invitation in sessionStorage:', facilitatorParams);
        } catch (error) {
          console.error('Error parsing facilitator params from sessionStorage:', error);
        }
      }

      // Fall back to URL params if sessionStorage doesn't have it
      if (!facilitatorParams) {
        const urlParams = new URLSearchParams(window.location.search);
        facilitatorParams = {
          acceptFacilitatorInvitation: urlParams.get('acceptFacilitatorInvitation'),
          email: urlParams.get('email'),
          vehicleId: urlParams.get('vehicleId'),
          productId: urlParams.get('productId'),
          inviterName: urlParams.get('inviterName'),
          productName: urlParams.get('productName'),
          vehicleName: urlParams.get('vehicleName')
        };
      }

      const { acceptFacilitatorInvitation, email, vehicleId: vehicleIdParam, productId: productIdParam } = facilitatorParams;

      if (acceptFacilitatorInvitation === 'true' && email && vehicleIdParam && productIdParam) {
        console.log('📧 [Vehicle Approval] Processing facilitator invitation:', { 
          vehicleId: vehicleIdParam, 
          productId: productIdParam, 
          email 
        });

        // Clear sessionStorage params
        if (sessionStorageParams) {
          sessionStorage.removeItem('facilitatorInvitationParams');
        }

        try {
          // Get auth token
          const getCookie = (name: string) => {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop()?.split(';').shift();
            return null;
          };

          let token = getCookie('access_token') || getCookie('token');
          if (!token) {
            console.error('No auth token found');
            return;
          }

          const { API_CONFIG } = await import('@/lib/config/api');
          const response = await fetch(`${API_CONFIG.BASE_URL}/invitations/facilitator/accept`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              vehicleId: parseInt(vehicleIdParam),
              productId: parseInt(productIdParam),
              email: email,
            }),
          });

          console.log('📥 [Vehicle Approval] Facilitator invitation response status:', response.status);
          const data = await response.json();
          console.log('📥 [Vehicle Approval] Facilitator invitation response data:', data);

          if (data.success) {
            showToast.success('Successfully joined as a facilitator!');
            
            // Refresh vehicle data
            await fetchVehicleData();

            // Clean up URL params
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('acceptFacilitatorInvitation');
            newUrl.searchParams.delete('email');
            newUrl.searchParams.delete('vehicleId');
            newUrl.searchParams.delete('productId');
            newUrl.searchParams.delete('inviterName');
            newUrl.searchParams.delete('productName');
            newUrl.searchParams.delete('vehicleName');
            window.history.replaceState({}, '', newUrl.toString());
          } else {
            console.error('Failed to accept facilitator invitation:', data.error);
            showToast.error(data.error || 'Failed to accept facilitator invitation');
          }
        } catch (error) {
          console.error('Error accepting facilitator invitation:', error);
          showToast.error('Failed to accept facilitator invitation');
        }
      }
    };

    // Small delay to ensure currentUserId is set
    const timer = setTimeout(() => {
      handleFacilitatorInvitation();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentUserId, vehicleId, productId]);

  const fetchVehicleData = async () => {
    if (!vehicleId) {
      router.push('/');
      return;
    }

    try {
      setIsLoading(true);
      
      // Fetch vehicle data
      const vehicleResponse = await vehicleService.getVehicle(parseInt(vehicleId));
      let vehicleDataToSet = vehicleResponse?.vehicle;
      
      if (vehicleDataToSet) {
        // Also fetch from /vehicle/by-ids to get creator_name and impact_report
        try {
          const vehiclesByIds = await fastApiService.getVehiclesByIds([parseInt(vehicleId)]);
          if (vehiclesByIds && Array.isArray(vehiclesByIds) && vehiclesByIds.length > 0) {
            const vehicleFromByIds = vehiclesByIds[0];
            // Merge creator_name and impact_report from by-ids API
            vehicleDataToSet = {
              ...vehicleDataToSet,
              creator_name: vehicleFromByIds.creator_name,
              impact_report: vehicleFromByIds.impact_report
            };
          }
        } catch (byIdsError) {
          console.warn('[Vehicle Approval] Could not fetch from /vehicle/by-ids, using getVehicle data only:', byIdsError);
        }
        
        console.log('[Vehicle Approval] Vehicle data fetched:', {
          id: vehicleDataToSet.id,
          creator_name: vehicleDataToSet.creator_name,
          members: vehicleDataToSet.members?.map((m: any) => ({
            name: m.user?.name,
            role: m.role,
            approvalStatus: m.approvalStatus
          })),
          facilitators: vehicleDataToSet.facilitators
        });
        setVehicleData(vehicleDataToSet);
        
        // Set chosen product if productId is provided
        if (productId && vehicleDataToSet.product) {
          setChosenProduct(vehicleDataToSet.product);
        }
      }

      // Impact analysis API call is NOT made here - it's only called during vehicle creation
      // The impact_report data is fetched from /vehicle/by-ids if available
      setImpactAnalysisData(vehicleDataToSet?.impact_report || null);
      
      // Note: GET /vehicle/{id}/lead-members is automatically called by VehicleSimulationTitle component

    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      router.push('/');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId, productId]);

  // Auto-open simulation when data is loaded
  useEffect(() => {
    if (vehicleData && !isLoading) {
      console.log('🚀 Auto-opening vehicle simulation');
      // Small delay to ensure everything is rendered
      const timer = setTimeout(() => {
        console.log('✅ Setting showSimulation to true');
      setShowSimulation(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [vehicleData, isLoading]);

  // Debug: Log approval status
  useEffect(() => {
    if (vehicleData && currentUserId) {
      console.log('🔍 Approval Status Check:', {
        currentUserId,
        members: vehicleData.members?.map((m: any) => ({
          userId: m.user?.id || m.userId,
          name: m.user?.name,
          approvalStatus: m.approvalStatus
        })),
        currentUserMembership,
        hasApproved
      });
    }
  }, [vehicleData, currentUserId, currentUserMembership, hasApproved]);

  if (isLoading) {
    return (
      <div className="bg-[#EAEDF2] flex items-center justify-center min-h-screen">
        <Loader size="sm" text="Loading vehicle simulation..." />
      </div>
    );
  }

  if (!vehicleData) {
    return (
      <div className="bg-[#EAEDF2] flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-[18px] font-semibold">Vehicle not found</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-[#2B3484] text-white rounded"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#EAEDF2] min-h-screen">
      {showSimulation ? (
        <div className="fixed inset-0 bg-[#EAEDF2] flex items-center justify-center z-50 p-8">
          <div className="flex flex-col items-center justify-center w-full h-full">
            <VehicleSimulation 
              vehicleData={{
                name: vehicleData.name,
                description: vehicleData.description,
                owner: vehicleData.creator_name || 
                       vehicleData.creator?.name || 
                       vehicleData.members?.find((m: any) => m.role === 'OWNER')?.user?.name || 
                       vehicleData.members?.[0]?.user?.name || 
                       'Unknown',
                productName: vehicleData.product?.name || chosenProduct?.name,
                members: vehicleData.members?.map((m: any) => ({
                  id: m.user?.id || m.id,
                  name: m.user?.name || m.name,
                  role: m.role || m.userRole,
                  position: m.role || m.userRole,
                  avatar: m.user?.avatar || m.avatar || '/Ellipse 5.svg',
                  email: m.user?.email || m.email,
                  approvalStatus: m.approvalStatus || 'pending' // Add approval status
                })) || [],
                facilitators: vehicleData.facilitators?.map((f: any) => ({
                  id: f.id || f.user?.id,
                  name: f.name || f.user?.name || '',
                  email: f.email || f.user?.email || '',
                  role: f.role || 'FACILITATOR',
                  avatar: f.user?.avatar || f.avatar || '/Ellipse 5.svg',
                })) || [],
                id: vehicleData.id,
                featureTags: vehicleData.featureTags,
                date: vehicleData.startDate ? new Date(vehicleData.startDate) : undefined
              }}
              onVehicleDataRefresh={async () => {
                // Refresh vehicle data after facilitator is added
                console.log('[Vehicle Approval] Refreshing vehicle data after facilitator added');
                await fetchVehicleData();
              }}
              allApproversApproved={(() => {
                if (!vehicleData?.members || vehicleData.members.length === 0) return false;
                const approvers = vehicleData.members.filter((m: any) => {
                  const role = (m.role || '').toUpperCase();
                  return role !== 'OWNER' && role !== 'FACILITATOR';
                });
                if (approvers.length === 0) return false;
                return approvers.every((m: any) => {
                  const approvalStatus = (m.approvalStatus || 'pending').toLowerCase();
                  return approvalStatus === 'approved';
                });
              })()}
              hasFacilitators={(vehicleData?.facilitators && vehicleData.facilitators.length > 0) || false}
              impactAnalysisData={impactAnalysisData}
              isApprover={isApprover}
              hasApproved={hasApproved}
              onApprove={async () => {
                if (!vehicleId || !currentUserId) return;
                
                setIsApproving(true);
                try {
                  // Determine approval_type based on user's role
                  const userRole = (currentUserMembership?.role || '').toLowerCase();
                  let approvalType = 'engineering'; // default
                  
                  if (userRole.includes('design') || userRole.includes('designer') || userRole.includes('ux') || userRole.includes('ui')) {
                    approvalType = 'design';
                  } else if (userRole.includes('engineer') || userRole.includes('engineering') || userRole.includes('qa')) {
                    approvalType = 'engineering';
                  }
                  
                  console.log('[Vehicle Approval] User role:', userRole, 'Approval type:', approvalType);
                  
                  // Use FastAPI instead of Node.js API
                  const result = await fastApiService.approveVehicle(
                    parseInt(vehicleId),
                    currentUserId,
                    approvalType,
                    'approved'
                  );
                  
                  if (result?.status === 'ok') {
                    showToast.success('Vehicle approved successfully!');
                    
                    // Refresh vehicle data to show updated approval status
                    const vehicleResponse = await vehicleService.getVehicle(parseInt(vehicleId));
                    if (vehicleResponse?.vehicle) {
                      console.log('[Vehicle Approval] Refreshed vehicle data:', {
                        id: vehicleResponse.vehicle.id,
                        members: vehicleResponse.vehicle.members?.map((m: any) => ({
                          name: m.user?.name,
                          role: m.role,
                          approvalStatus: m.approvalStatus
                        })),
                        facilitators: vehicleResponse.vehicle.facilitators
                      });
                      setVehicleData(vehicleResponse.vehicle);
                    }
                  } else {
                    showToast.error('Failed to approve vehicle. Please try again.');
                  }
                } catch (error: any) {
                  console.error('Error approving vehicle:', error);
                  const errorMessage = error.response?.data?.detail || 
                                     error.response?.data?.error || 
                                     error.response?.data?.message || 
                                     error.message || 
                                     'Failed to approve vehicle. Please try again.';
                  showToast.error(errorMessage);
                } finally {
                  setIsApproving(false);
                }
              }}
              onCloseSimulation={() => setShowSimulation(false)}
              isApproving={isApproving}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center min-h-screen p-8">
          <Loader size="sm" text="Loading simulation..." />
        </div>
      )}
    </div>
  );
}

