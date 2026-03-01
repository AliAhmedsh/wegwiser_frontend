import useLoginStore from '@/store/TO_DELETE/loginStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuthGuard = (
  WrappedComponent: React.ComponentType,
  redirectTo: string = '/login'
) => {
  const ComponentWithGuard = () => {
    const { user, isInitialized, initializeFromToken } = useLoginStore();
    const router = useRouter();

    useEffect(() => {

      initializeFromToken();
    }, [initializeFromToken]);

    useEffect(() => {

      if (isInitialized && !user) {
        router.replace(redirectTo);
      }
    }, [user, isInitialized, router, redirectTo]);

    if (!isInitialized) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }


    if (!user) return null;

    return <WrappedComponent />;
  };

  ComponentWithGuard.displayName = `WithAuthGuard(${WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`;

  return ComponentWithGuard;
};

export default withAuthGuard;
