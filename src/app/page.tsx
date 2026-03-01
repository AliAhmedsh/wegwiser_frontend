'use client';

import withAuthGuard from '@/hoc/guards/withAuthGuard';
import Home from '@/sections/home/Home';
import { API_CONFIG, getCookie } from '@/lib/config/api';
import { showToast } from '@/lib/utils/toast';
import useLoginStore from '@/store/TO_DELETE/loginStore';
import { useInvitationStore } from '@/store/invitationStore';
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const Page = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: loggedUser } = useLoginStore();
  const { setIsAcceptingInvitation } = useInvitationStore();

  useEffect(() => {
    // Refresh product list when user lands on home page
    // This ensures newly joined products appear immediately
    queryClient.invalidateQueries({ queryKey: ['products'] });

    // Prefetch user profile data so it's ready when profile modal opens
    if (loggedUser) {
      queryClient.prefetchQuery({
        queryKey: ['user', 'profile'],
        queryFn: async () => {
          const { userService } = await import('@/entities/user/api/userService');
          const response = await userService.getProfile();
          return response.profile;
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
      }).catch((error) => {
        // Silently fail prefetch - don't show errors for background prefetching
        console.log('Profile prefetch failed (non-critical):', error.message);
      });
    }

    // Check if user came from invitation acceptance
    const fromInvitation = sessionStorage.getItem('fromInvitation');
    if (fromInvitation) {
      console.log('User came from invitation acceptance, ensuring product selection');
      sessionStorage.removeItem('fromInvitation');
    }

    // Handle vehicle approval auto-open simulation
    // Check both URL params and sessionStorage (for cases where params might be lost)
    const checkAndRedirect = () => {
      let autoOpenSimulation = searchParams.get('autoOpenSimulation');
      let vehicleId = searchParams.get('vehicleId');
      let productId = searchParams.get('productId');
      
      // Check for facilitator invitation - should also redirect to vehicle-approval page
      const facilitatorParamsStr = sessionStorage.getItem('facilitatorInvitationParams');
      if (facilitatorParamsStr) {
        try {
          const facilitatorParams = JSON.parse(facilitatorParamsStr);
          if (facilitatorParams.acceptFacilitatorInvitation === 'true' && facilitatorParams.vehicleId) {
            console.log('✅ Found facilitator invitation params in sessionStorage, redirecting to vehicle-approval:', facilitatorParams);
            vehicleId = facilitatorParams.vehicleId;
            productId = facilitatorParams.productId;
            // Don't clear sessionStorage here - let vehicle-approval page handle it
            router.push(`/vehicle-approval?vehicleId=${vehicleId}&productId=${productId || ''}&acceptFacilitatorInvitation=true&email=${encodeURIComponent(facilitatorParams.email || '')}&autoOpenSimulation=true`);
            return;
          }
        } catch (error) {
          console.error('Error parsing facilitator params from sessionStorage:', error);
        }
      }
      
      // Check sessionStorage for approver params (set by login form or withUserGuard)
      const approverParamsStr = sessionStorage.getItem('approverParams');
      if (approverParamsStr) {
        try {
          const approverParams = JSON.parse(approverParamsStr);
          if (approverParams.autoOpenSimulation === 'true') {
            console.log('✅ Found approver params in sessionStorage:', approverParams);
            autoOpenSimulation = 'true';
            vehicleId = approverParams.vehicleId || vehicleId;
            productId = approverParams.productId || productId;
            // Clear sessionStorage after reading
            sessionStorage.removeItem('approverParams');
          }
        } catch (error) {
          console.error('Error parsing approver params from sessionStorage:', error);
          sessionStorage.removeItem('approverParams');
        }
      }
    
    if (autoOpenSimulation === 'true' && vehicleId && loggedUser) {
        console.log('🚀 Redirecting to vehicle-approval page:', { vehicleId, productId });
      // Redirect to vehicle-approval page which will auto-open simulation
      router.push(`/vehicle-approval?vehicleId=${vehicleId}&productId=${productId || ''}&autoOpenSimulation=true`);
      }
    };

    // Small delay to ensure sessionStorage is set (for already logged-in users)
    if (loggedUser) {
      const timer = setTimeout(() => {
        checkAndRedirect();
      }, 100);
      return () => clearTimeout(timer);
    } else {
      checkAndRedirect();
    }
  }, [queryClient, searchParams, loggedUser, router]);

  // Auto-accept invitation when landing on home page with invitation params
  useEffect(() => {
    
    const acceptInvitation = async () => {
      // Set loading state at the start
      setIsAcceptingInvitation(true);
      
      try {
        // Try to get invitation params from multiple sources
        // 1. First check sessionStorage (set by login form before redirect)
        let invitationParams: any = null;
        const sessionStorageParams = sessionStorage.getItem('invitationParams');
        
        if (sessionStorageParams) {
          invitationParams = JSON.parse(sessionStorageParams);
          sessionStorage.removeItem('invitationParams'); // Clear it after reading
        } else {
          // 2. Fall back to URL params
          const urlParams = new URLSearchParams(window.location.search);
          invitationParams = {
            acceptInvitation: urlParams.get('acceptInvitation'),
            acceptFacilitatorInvitation: urlParams.get('acceptFacilitatorInvitation'),
            email: urlParams.get('email'),
            productId: urlParams.get('productId'),
            vehicleId: urlParams.get('vehicleId'),
            inviterName: urlParams.get('inviterName'),
            productName: urlParams.get('productName'),
            vehicleName: urlParams.get('vehicleName'),
            role: urlParams.get('role'),
          };
        }

        if (!invitationParams) {
          return;
        }

        const {
          acceptInvitation: acceptInvitationFlag,
          acceptFacilitatorInvitation: acceptFacilitatorInvitationFlag,
          email,
          productId,
          vehicleId,
          inviterName,
          productName,
          vehicleName,
          role
        } = invitationParams;

       

        // Don't process if user is not logged in
        if (!loggedUser) {
          return;
        }


        // Get authentication token
        let token = getCookie('access_token');
        if (!token) {
          token = getCookie('token');
        }

        if (!token) {
          console.error('No authentication token found');
          return;
        }

        // Handle facilitator invitation
        if (acceptFacilitatorInvitationFlag === 'true' && vehicleId && productId && email) {
          console.log('📧 Accepting facilitator invitation:', { vehicleId, productId, email });

          const response = await fetch(`${API_CONFIG.BASE_URL}/invitations/facilitator/accept`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              vehicleId: parseInt(vehicleId),
              productId: parseInt(productId),
              email: email,
            }),
          });

          console.log('📥 Facilitator invitation response status:', response.status);
          const data = await response.json();
          console.log('📥 Facilitator invitation response data:', data);

          if (data.success) {
            showToast.success(`Successfully joined ${vehicleName} as a facilitator!`);

            // Refresh relevant queries
            await queryClient.refetchQueries({ queryKey: ['products'] });
            await queryClient.refetchQueries({ queryKey: ['vehicles'] });
            await queryClient.invalidateQueries({ queryKey: ['vehicles', 'detail', parseInt(vehicleId)] });
            await queryClient.refetchQueries({ queryKey: ['vehicles', 'detail', parseInt(vehicleId)] });

            // Clean up URL params
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('acceptFacilitatorInvitation');
            newUrl.searchParams.delete('email');
            newUrl.searchParams.delete('productId');
            newUrl.searchParams.delete('vehicleId');
            newUrl.searchParams.delete('inviterName');
            newUrl.searchParams.delete('productName');
            newUrl.searchParams.delete('vehicleName');
            window.history.replaceState({}, '', newUrl.toString());

            // Don't redirect - stay on the current page
            // The vehicle popup will fetch updated data when it opens
          } else {
            console.error('Failed to accept facilitator invitation:', data.error);
            showToast.error(data.error || 'Failed to accept facilitator invitation');
          }
          return;
        }

        // Handle product invitation
        if (acceptInvitationFlag === 'true' && email && productId) {

          const response = await fetch(`${API_CONFIG.BASE_URL}/invitations/accept`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              productId: parseInt(productId),
              email: email,
            }),
          });

          const data = await response.json();

          if (data.success) {
            showToast.success(`Successfully joined ${productName}!`);

            // Refresh product queries to show the new product
            await queryClient.refetchQueries({ queryKey: ['products'] });

            // Clean up URL params to prevent re-processing
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.delete('acceptInvitation');
            newUrl.searchParams.delete('email');
            newUrl.searchParams.delete('productId');
            newUrl.searchParams.delete('inviterName');
            newUrl.searchParams.delete('productName');
            newUrl.searchParams.delete('role');
            window.history.replaceState({}, '', newUrl.toString());
          } else {
            console.error('Failed to accept invitation:', data.error);
            showToast.error(data.error || 'Failed to join product');
          }
          return;
        }

      } catch (error) {
        console.error('Error accepting invitation:', error);
        showToast.error('Failed to accept invitation');
      } finally {
        // Always clear loading state
        setIsAcceptingInvitation(false);
      }
    };

    // Wait a bit for page to fully mount, then check for invitation params
    const timer = setTimeout(() => {
      
      if (loggedUser) {
        acceptInvitation();
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [loggedUser, queryClient, router]);

  const handleLogoClick = () => {
    router.push('/');
  };

  return (
    <div>
      <Image
        className="fixed left-20 top-5 cursor-pointer"
        width={120}
        height={34}
        src={'/icons/logo.svg'}
        alt="logo"
        priority
        onClick={handleLogoClick}
      />
      <Home />
    </div>
  );
};

export default withAuthGuard(Page);
