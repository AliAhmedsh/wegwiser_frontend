import useLoginStore from '@/store/TO_DELETE/loginStore';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

const withUserGuard = (
  WrappedComponent: React.ComponentType,
  redirectTo: string = '/'
) => {
  const ComponentWithGuard = () => {
    const { user, isInitialized, initializeFromToken } = useLoginStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
      initializeFromToken();
    }, [initializeFromToken]);

    useEffect(() => {
      if (isInitialized && user) {
        // If user is already logged in and there's a returnTo with approver params, save to sessionStorage
        const returnTo = searchParams.get('returnTo');
        if (returnTo) {
          try {
            const invitationParams = new URLSearchParams(returnTo.split('?')[1]);
            
            // Handle vehicle approval (auto-open simulation) - for approvers
            if (invitationParams.get('autoOpenSimulation') === 'true') {
              console.log('💾 withUserGuard: User already logged in - storing vehicle approval params in sessionStorage');
              sessionStorage.setItem('approverParams', JSON.stringify({
                vehicleId: invitationParams.get('vehicleId'),
                productId: invitationParams.get('productId'),
                autoOpenSimulation: 'true',
                approverEmail: invitationParams.get('approverEmail')
              }));
            }
          } catch (error) {
            console.error('Error handling returnTo in withUserGuard:', error);
          }
        }
        
        router.replace(redirectTo);
      }
    }, [user, isInitialized, router, redirectTo, searchParams]);

    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }


    if (user) return null;

    return <WrappedComponent />;
  };

  ComponentWithGuard.displayName = `WithAuthGuard(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

  return ComponentWithGuard;
};

export default withUserGuard;
