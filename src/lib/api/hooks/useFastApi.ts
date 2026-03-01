import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fastApiService } from '../services/fastApiService';

// Type definitions for FastAPI service requests
export interface VehiclePersistRequest {
  prd_id: string;
  vehicles: any[];
  product_id: number;
  created_by: number;
}

export interface VehicleStep1Request {
  user_id: string;
  prd_id: string;
  product_id: number;
  created_by: number;
}

export interface VehicleStep2Request {
  user_id: string;
  vehicle_id?: number;
}

export interface VehicleStep3Request {
  user_id: string;
  vehicle_id: number;
  feedback?: string;
  files?: File[];
}

export interface RefineDocRequest {
  user_id: string;
  files: File[];
}

export interface PRDSubmitSchema {
  title: string;
  content: string;
  user_id: string;
  product_id?: number;
}

export interface PRDUpdateRequest {
  prd_id: string;
  change_request: string;
  changed_by: number;
  change_reason?: string;
  session_id?: string;
  insist_original?: boolean;
}

export interface PRDUpdateApproveRequest {
  prd_id: string;
  change_batch_id?: string;
  approved: boolean;
}

export interface VehicleSkillEvaluationRequest {
  user_id: number;
  vehicle_id: number;
  code: Array<{ language: string; snippet: string }>;
  role: string;
  time_range: { startTime: number; endTime: number };
}

export interface VehicleMemberSkillMatchRequest {
  vehicle_id: number;
  order?: 'asc' | 'desc';
}

export interface VehicleMemberSkillScoresRequest {
  vehicle_id: number;
}

export interface VehicleCodegenRequest {
  prd_id: string;
  vehicle_id: number;
  filename: string;
  target?: string;
  instruction?: string;
  language?: string;
  framework?: string;
}

export interface MemberSkillScoreCreate {
  member_id: number;
  skill_name: string;
  score: number;
}

export interface MemberSkillScoreEWMAUpdate {
  score_id: number;
  new_score: number;
}

export interface ImpactAnalyzeVehicleRequest {
  vehicle_ids: number[];
}
import { showToast } from '@/lib/utils/toast';

// ══════════════════════════════════════════════════════════════════════
//  Query Keys
// ══════════════════════════════════════════════════════════════════════
export const fastApiKeys = {
  all: ['fastApi'] as const,
  // Workflow
  workflowStatus: (prdId: string) => [...fastApiKeys.all, 'workflowStatus', prdId] as const,
  // Vehicle
  vehicleByIds: (ids: string[]) => [...fastApiKeys.all, 'vehicleByIds', ...ids] as const,
  // Tech Stacks
  techStacksByVehicle: (vehicleId: string) => [...fastApiKeys.all, 'techStacks', vehicleId] as const,
  techStacks: () => [...fastApiKeys.all, 'techStacks'] as const,
  // Member Skill Scores
  memberSkillScores: (params?: any) => [...fastApiKeys.all, 'memberSkillScores', params] as const,
  memberScore: (scoreId: string) => [...fastApiKeys.all, 'memberScore', scoreId] as const,
  // Vehicle Member Skill Match
  vehicleMemberSkillMatch: (vehicleId: string) => [...fastApiKeys.all, 'vehicleMemberSkillMatch', vehicleId] as const,
  // Vehicle Member Skill Scores (team aggregate)
  vehicleMemberSkillScores: (vehicleId: string) => [...fastApiKeys.all, 'vehicleMemberSkillScores', vehicleId] as const,
  // Personal performance (calculate-scores)
  memberPerformance: (memberId: number) => [...fastApiKeys.all, 'memberPerformance', memberId] as const,
  // Health
  health: () => [...fastApiKeys.all, 'health'] as const,
};

// ══════════════════════════════════════════════════════════════════════
//  Vehicle Steps (AI Generation)
// ══════════════════════════════════════════════════════════════════════

/** POST /vehicle/step1-basics - Extract basic vehicle list from PRD */
export function useVehicleStep1Mutation() {
  return useMutation({
    mutationFn: (data: VehicleStep1Request) => 
      fastApiService.vehicleStep1Basics(
        data.user_id,
        data.prd_id,
        data.product_id,
        data.created_by
      ),
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to generate vehicle basics.';
      showToast.error(msg);
    },
  });
}

/** POST /vehicle/step2-assumptions - Generate assumptions and correlations */
export function useVehicleStep2Mutation() {
  return useMutation({
    mutationFn: (data: VehicleStep2Request) => 
      fastApiService.vehicleStep2Assumptions(
        data.user_id,
        data.vehicle_id || 0
      ),
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to generate assumptions.';
      showToast.error(msg);
    },
  });
}

/** POST /vehicle/step3-finalize - Finalize complete vehicle plan */
export function useVehicleStep3Mutation() {
  return useMutation({
    mutationFn: (data: VehicleStep3Request) => 
      fastApiService.vehicleStep3Finalize(
        data.user_id,
        data.vehicle_id,
        data.feedback,
        data.files
      ),
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to finalize vehicle plan.';
      showToast.error(msg);
    },
  });
}

/** POST /vehicle/persist - Save vehicles to database */
export function useVehiclePersistMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VehiclePersistRequest) => 
      fastApiService.vehiclePersist(
        data.prd_id,
        data.vehicles,
        data.product_id,
        data.created_by
      ),
    onSuccess: () => {
      showToast.success('Vehicles persisted successfully!');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to persist vehicles.';
      showToast.error(msg);
    },
  });
}

/** GET /vehicle/by-ids - Fetch vehicles by their IDs */
export function useVehicleByIds(ids: string[], enabled = true) {
  return useQuery({
    queryKey: fastApiKeys.vehicleByIds(ids),
    queryFn: () => fastApiService.vehicleByIds(ids),
    enabled: enabled && ids.length > 0,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

// ══════════════════════════════════════════════════════════════════════
//  PM / Workflow
// ══════════════════════════════════════════════════════════════════════

/** POST /pm/refine-doc - Refine PRD document */
export function usePmRefineDocMutation() {
  return useMutation({
    mutationFn: (data: RefineDocRequest) => fastApiService.pmRefineDoc(data),
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to refine PRD document.';
      showToast.error(msg);
    },
  });
}

/** POST /workflow/submit - Submit PRD for parsing workflow */
export function useWorkflowSubmitMutation() {
  return useMutation({
    mutationFn: (data: PRDSubmitSchema) => fastApiService.workflowSubmit(data),
    onSuccess: () => {
      showToast.success('PRD submitted for processing!');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to submit workflow.';
      showToast.error(msg);
    },
  });
}

/** POST /workflow/prd-update - Preview PRD changes */
export function useWorkflowPrdUpdateMutation() {
  return useMutation({
    mutationFn: (data: PRDUpdateRequest) => fastApiService.workflowPrdUpdate(data),
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to preview PRD update.';
      showToast.error(msg);
    },
  });
}

/** POST /workflow/prd-update/approve - Approve PRD changes */
export function useWorkflowPrdUpdateApproveMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: PRDUpdateApproveRequest) => fastApiService.workflowPrdUpdateApprove(data),
    onSuccess: () => {
      showToast.success('PRD update approved!');
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to approve PRD update.';
      showToast.error(msg);
    },
  });
}

/** GET /workflow/status/{prdId} - Check workflow processing status */
export function useWorkflowStatus(prdId: string, enabled = true, refetchInterval?: number | false) {
  return useQuery({
    queryKey: fastApiKeys.workflowStatus(prdId),
    queryFn: () => fastApiService.workflowStatus(prdId),
    enabled: enabled && !!prdId,
    staleTime: 10 * 1000, // 10 seconds
    refetchInterval: refetchInterval ?? false,
    retry: 2,
  });
}

// ══════════════════════════════════════════════════════════════════════
//  Evaluation
// ══════════════════════════════════════════════════════════════════════

/** POST /evaluation/evaluate - Evaluate vehicle skill scores (after task completion) */
export function useEvaluateVehicleMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: VehicleSkillEvaluationRequest) => fastApiService.evaluateVehicle(data),
    onSuccess: (_data, variables) => {
      // Invalidate member skill scores so UI refreshes
      queryClient.invalidateQueries({ queryKey: fastApiKeys.all });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Evaluation failed.';
      showToast.error(msg);
    },
  });
}

// ══════════════════════════════════════════════════════════════════════
//  Member Skill Scores
// ══════════════════════════════════════════════════════════════════════

/** POST /member-skill-scores/calculate-scores - Get personal performance analytics */
export function useMemberPerformance(memberId: number, enabled = true) {
  return useQuery({
    queryKey: fastApiKeys.memberPerformance(memberId),
    queryFn: () => fastApiService.calculateMemberScores({ member_id: memberId }),
    enabled: enabled && !!memberId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

/** POST /member-skill-scores/vehicle-member-skill-scores - Vehicle team aggregate scores */
export function useVehicleMemberSkillScores(vehicleId: number, enabled = true) {
  return useQuery({
    queryKey: fastApiKeys.vehicleMemberSkillScores(String(vehicleId)),
    queryFn: () => fastApiService.vehicleMemberSkillScores({ vehicle_id: vehicleId }),
    enabled: enabled && !!vehicleId,
    staleTime: 2 * 60 * 1000,
    retry: false, // 404 expected when vehicle tech stack does not intersect member skills
  });
}

/** POST /member-skill-scores/vehicle-member-skill-match - Get sorted members by skill match */
export function useVehicleMemberSkillMatch(vehicleId: number, order: 'asc' | 'desc' = 'desc', enabled = true) {
  return useQuery({
    queryKey: fastApiKeys.vehicleMemberSkillMatch(String(vehicleId)),
    queryFn: () => fastApiService.vehicleMemberSkillMatch({ vehicle_id: vehicleId, order }),
    enabled: enabled && !!vehicleId,
    staleTime: 2 * 60 * 1000,
    retry: false, // 404 is expected for vehicles with no members yet
  });
}

/** POST /member-skill-scores - Create a new skill score */
export function useCreateMemberSkillScoreMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MemberSkillScoreCreate) => fastApiService.createMemberSkillScore(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fastApiKeys.memberSkillScores() });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to create skill score.';
      showToast.error(msg);
    },
  });
}

/** POST /member-skill-scores/ewma-update - EWMA update existing score */
export function useEwmaUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: MemberSkillScoreEWMAUpdate) => fastApiService.memberSkillScoreEwmaUpdate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fastApiKeys.memberSkillScores() });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Failed to update skill score.';
      showToast.error(msg);
    },
  });
}

/** GET /member-skill-scores - List member skill scores (paginated) */
export function useMemberSkillScores(params?: { member_id?: number; skill_name?: string; page?: number; page_size?: number }, enabled = true) {
  return useQuery({
    queryKey: fastApiKeys.memberSkillScores(params),
    queryFn: () => fastApiService.listMemberSkillScores(params),
    enabled,
    staleTime: 2 * 60 * 1000,
    retry: 2,
  });
}

// ══════════════════════════════════════════════════════════════════════
//  Vehicle Tech Stacks
// ══════════════════════════════════════════════════════════════════════

/** GET /vehicle-tech-stacks/by-vehicle/{vehicleId} */
export function useVehicleTechStacks(vehicleId: string, enabled = true) {
  return useQuery({
    queryKey: fastApiKeys.techStacksByVehicle(vehicleId),
    queryFn: () => fastApiService.getVehicleTechStacksByVehicle(vehicleId),
    enabled: enabled && !!vehicleId,
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });
}

// ══════════════════════════════════════════════════════════════════════
//  Engineering Code-gen
// ══════════════════════════════════════════════════════════════════════

/** POST /engineering/generate-by-vehicle - Generate engineering code from PRD + vehicle */
export function useEngineeringGenerateByVehicleMutation() {
  return useMutation({
    mutationFn: (data: VehicleCodegenRequest) => fastApiService.engineeringGenerateByVehicle(data),
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Code generation failed.';
      showToast.error(msg);
    },
  });
}

// ══════════════════════════════════════════════════════════════════════
//  Impact Analysis
// ══════════════════════════════════════════════════════════════════════

/** POST /impact/analyze-vehicle */
export function useImpactAnalyzeVehicleMutation() {
  return useMutation({
    mutationFn: (data: ImpactAnalyzeVehicleRequest) => fastApiService.impactAnalyzeVehicle(data),
    onError: (error: any) => {
      const msg = error.response?.data?.detail || error.message || 'Impact analysis failed.';
      showToast.error(msg);
    },
  });
}

// ══════════════════════════════════════════════════════════════════════
//  Health Check
// ══════════════════════════════════════════════════════════════════════

export function useFastApiHealth() {
  return useQuery({
    queryKey: fastApiKeys.health(),
    queryFn: () => fastApiService.healthCheck(),
    staleTime: 30 * 1000,
    retry: 1,
  });
}
