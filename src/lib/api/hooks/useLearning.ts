import { useMutation } from '@tanstack/react-query';
import aiService, { LearningRequest, LearningResponse } from '../services/aiService';

export const useLearning = () => {
  return useMutation<LearningResponse, Error, LearningRequest>({
    mutationFn: (data: LearningRequest) => aiService.learning(data),
  });
};

export default useLearning;
