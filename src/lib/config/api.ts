const getBaseUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (!apiUrl) {
    return 'http://localhost:3001/api';
  }
  
  return `${apiUrl}/api`;
};

const getFastAPIUrl = () => {
  const fastApiUrl = process.env.NEXT_PUBLIC_FASTAPI_URL;
  if (!fastApiUrl) {
    return 'https://bfp7ecvmnz.us-east-2.awsapprunner.com';
  }
  return fastApiUrl;
};

export const API_CONFIG = {
  BASE_URL: getBaseUrl(),
  FASTAPI_URL: getFastAPIUrl(),
  TIMEOUT: 30000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
} as const;

export const getCookie = (name: string): string | null => {

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    if (cookieValue) return cookieValue;
  }

  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.trim().split('=');
    if (cookieName === name) {
      return cookieValue;
    }
  }
  
  return null;
};

export const setCookie = (name: string, value: string, days: number = 7): void => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
};

export const removeCookie = (name: string): void => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};
