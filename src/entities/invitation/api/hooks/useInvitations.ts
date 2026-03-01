import { useMutation } from '@tanstack/react-query';
import { invitationService, ProductInvitation, BulkProductInvitation } from '../invitationService';

export function useSendProductInvitation() {
  return useMutation({
    mutationFn: (invitation: ProductInvitation) => 
      invitationService.sendProductInvitation(invitation),
  });
}

export function useSendBulkProductInvitations() {
  return useMutation({
    mutationFn: (invitation: BulkProductInvitation) => 
      invitationService.sendBulkProductInvitations(invitation),
  });
}

export function useSendProductInvitationViaAuth0() {
  return useMutation({
    mutationFn: (invitation: ProductInvitation) => 
      invitationService.sendProductInvitationViaAuth0(invitation),
  });
}
