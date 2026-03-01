import { getFrontendUrl } from './frontendUrl';

export interface InvitationParams {
  token: string;
  email: string;
  productId: string;
}

export const parseInvitationUrl = (url: string): InvitationParams | null => {
  try {
    const urlObj = new URL(url);
    const token = urlObj.searchParams.get('token');
    const email = urlObj.searchParams.get('email');
    const productId = urlObj.searchParams.get('productId');

    if (!token || !email || !productId) {
      return null;
    }

    return { token, email, productId };
  } catch (error) {
    console.error('Error parsing invitation URL:', error);
    return null;
  }
};

export const generateInvitationUrl = (email: string, productId: number): string => {
  const baseUrl = getFrontendUrl();
  return `${baseUrl}/invitation/accept?token=invitation&email=${encodeURIComponent(email)}&productId=${productId}`;
};
