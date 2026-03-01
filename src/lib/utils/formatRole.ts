export const formatRole = (role: string | undefined | null): string => {
  if (!role) return 'User';
  
  const roleLower = role.toLowerCase().trim();
  
  // Product Manager - show as PM
  if (roleLower === 'product_manager' || roleLower === 'product manager' || roleLower === 'pm') {
    return 'PM';
  }
  
  switch (roleLower) {
    case 'engineer':
    case 'eng':
      return 'Engineer';
    case 'designer':
    case 'design':
    case 'ux/ui':
      return 'Designer';
    case 'founder':
    case 'ceo':
    case 'cpo':
    case 'founder/ceo/cpo':
      return 'Founder / CEO / CPO';
    case 'qa':
      return 'QA';
    case 'engineer/qa':
      return 'Engineer/QA';
    default:
      return role
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
  }
};

