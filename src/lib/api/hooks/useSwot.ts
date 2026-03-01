import { useMutation } from '@tanstack/react-query';
import aiService, { SwotRequest, SwotResponse } from '../services/aiService';

export const useSwot = () => {
  return useMutation<SwotResponse, Error, SwotRequest>({
    mutationFn: (data: SwotRequest) => aiService.swot(data),
  });
};

export default useSwot;
