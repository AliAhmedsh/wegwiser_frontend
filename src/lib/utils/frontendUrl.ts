
export const getFrontendUrl = (): string => {
  // If explicitly set in environment variables, use that
  if (process.env.NEXT_PUBLIC_FRONTEND_URL) {
    return process.env.NEXT_PUBLIC_FRONTEND_URL;
  }
  
  // Production fallback to Vercel URL
  if (process.env.NODE_ENV === 'production') {
    return 'https://wegwiser-frontend.vercel.app';
  }
  
  // Development fallback
  return 'http://localhost:3000';
};
