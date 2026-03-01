import { getCookie } from '@/lib/config/api';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id?: number;
  sub?: string;
  email?: string;
}

declare global {
  interface Window {
    __authTokenLogged?: boolean;
  }
}

export const getCurrentUserId = (): number | null => {
  let token = getCookie('access_token');
  if (!token) {
    token = getCookie('token');
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwtDecode<DecodedToken>(token);

    if (decoded.id) {
      return decoded.id;
    } else if (decoded.sub) {
      if (decoded.sub === 'auth0|68c5e421cf940f5831aa3034') {
        return 93;
      }

      const subParts = decoded.sub.split('|');
      const id = parseInt(subParts[subParts.length - 1]);
      return isNaN(id) ? null : id;
    }

    return null;
  } catch (error) {
    return null;
  }
};
