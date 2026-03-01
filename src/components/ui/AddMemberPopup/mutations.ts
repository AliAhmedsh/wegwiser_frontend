import { useMutation, useQueryClient } from '@tanstack/react-query';
import { invitationService, BulkProductInvitation } from '@/entities/invitation';
import { showToast } from '@/lib/utils/toast';

interface EmailMember {
  id: string;
  email: string;
}

interface UseInviteMembersProps {
  onSuccess?: (emails: string[]) => void;
  onError?: (error: any) => void;
}

export function useInviteMembers({ onSuccess, onError }: UseInviteMembersProps = {}) {
  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (bulkInvitationData: BulkProductInvitation) => 
      invitationService.sendBulkProductInvitations(bulkInvitationData),
    
    onSuccess: (result, variables) => {
      // Invalidate product queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.productId] });
      queryClient.invalidateQueries({ queryKey: ['product-members', variables.productId] });
    },
    
    onError: (error: any) => {
      console.error('Failed to send bulk invitations:', error);
    }
  });

  const inviteMembers = (emailList: EmailMember[], productId: string) => {
    if (emailList.length === 0 || !productId) return;
    
    // Prepare bulk invitation data
    const bulkInvitationData = {
      productId: parseInt(productId),
      invitations: emailList.map(item => ({
        email: item.email,
        role: 'Member' 
      }))
    };


    mutation.mutate(bulkInvitationData, {
      onSuccess: (result) => {
        // Show success message
        if (result.success) {
          const successfulCount = result.data.successful.length;
          const failedCount = result.data.failed.length;
          
          if (failedCount === 0) {
            showToast.success(`Successfully sent ${successfulCount} invitation(s)!`);
          } else if (successfulCount > 0) {
            // Some succeeded, some failed
            showToast.warning(`Sent ${successfulCount} invitation(s). ${failedCount} failed.`);
            
            // Show specific error messages for failed invitations
            result.data.failed.forEach((failed: any) => {
              if (failed.error.includes('already a member')) {
                showToast.warning(`${failed.email} is already a member of this product`);
              } else {
                showToast.error(`Failed to invite ${failed.email}: ${failed.error}`);
              }
            });
          } else {
            // All failed
            result.data.failed.forEach((failed: any) => {
              if (failed.error.includes('already a member')) {
                showToast.warning(`${failed.email} is already a member of this product`);
              } else {
                showToast.error(`Failed to invite ${failed.email}: ${failed.error}`);
              }
            });
          }
        }
        
        // Call the onSuccess callback with the emails
        const emails = emailList.map(item => item.email);
        onSuccess?.(emails);
      },
      onError: (error: any) => {
        console.error('Failed to invite members:', error);
        const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
        showToast.error(`Failed to send invitations: ${errorMessage}`);
        onError?.(error);
      }
    });
  };

  return {
    inviteMembers,
    isInviting: mutation.isPending,
    error: mutation.error
  };
}
