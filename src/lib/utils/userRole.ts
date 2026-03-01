// Utility functions for user role management
import { useState, useEffect } from 'react';

export const getUserRole = (): string | null => {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('userRole');
};

// React hook for user role that triggers re-renders
export const useUserRole = () => {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Get initial role
    const initialRole = getUserRole();
    setRole(initialRole);

    // Listen for storage changes (when role is updated in other tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userRole') {
        setRole(e.newValue);
      }
    };

    // Listen for custom events (when role is updated in same tab)
    const handleRoleChange = () => {
      setRole(getUserRole());
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('userRoleChanged', handleRoleChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userRoleChanged', handleRoleChange);
    };
  }, []);

  return role;
};

export const isProductManager = (): boolean => {
  const role = getUserRole();
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return (
    roleLower === 'product_manager' ||
    roleLower === 'product manager' ||
    roleLower === 'pm' ||
    roleLower === 'manager' ||
    (roleLower.includes('product') && roleLower.includes('manager'))
  );
};

export const isEngineer = (): boolean => {
  const role = getUserRole();
  console.log('isEngineer check - role from sessionStorage:', role);
  const isEngineerResult = role === 'engineer' || role === 'Engineer/QA' || role === 'ENGINEER/QA';
  console.log('isEngineer result:', isEngineerResult);
  return isEngineerResult;
};

export const isDesigner = (): boolean => {
  const role = getUserRole();
  return role === 'designer' || role === 'Design' || role === 'UX/UI';
};

// React hook versions that trigger re-renders
export const useIsProductManager = (): boolean => {
  const role = useUserRole();
  if (!role) return false;
  const roleLower = role.toLowerCase();
  return (
    roleLower === 'product_manager' ||
    roleLower === 'product manager' ||
    roleLower === 'pm' ||
    roleLower === 'manager' ||
    (roleLower.includes('product') && roleLower.includes('manager'))
  );
};

export const useIsEngineer = (): boolean => {
  const role = useUserRole();
  console.log('useIsEngineer check - role:', role);
  const isEngineerResult = role === 'engineer' || role === 'Engineer/QA' || role === 'ENGINEER/QA';
  console.log('useIsEngineer result:', isEngineerResult);
  return isEngineerResult;
};

export const useIsDesigner = (): boolean => {
  const role = useUserRole();
  return role === 'designer' || role === 'Design' || role === 'UX/UI';
};
