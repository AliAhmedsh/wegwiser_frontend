import { WorkerListProps } from '@/entities/worker/type';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface VehicleData {
  name: string;
  description: string;
}

interface CreationVehicleStore {
  step: number;
  vehicleData: VehicleData;
  vehicleMembers: WorkerListProps[];
  featureTags: string;
  date: Date | null;
  estimatedCompletionDate: Date | null;
  vehicleId: number | null;
  proposedVehicleId: number | null;
  productRelationship: string;
  involvedTeam: string;
  successMetrics: string;
  priority: string;
  assumptionsText: string;
  assumptionConversationId: string | null; // For multi-turn assumption refinement
  assumptionConversationStatus: 'PENDING' | 'COMPLETE' | null; // Track conversation status
  step3Feedback: string;
  step3Files: File[];
  setFeatureTags: (data: string) => void;
  incrementStep: () => void;
  decrimentStep: () => void;
  setDate: (date: Date) => void;
  setEstimatedCompletionDate: (date: Date) => void;
  setVehicleData: (data: VehicleData) => void;
  setMembers: (members: WorkerListProps[]) => void;
  setVehicleId: (id: number) => void;
  setProposedVehicleId: (id: number | null) => void;
  setProductRelationship: (data: string) => void;
  setInvolvedTeam: (data: string) => void;
  setSuccessMetrics: (data: string) => void;
  setPriority: (data: string) => void;
  setAssumptionsText: (text: string) => void;
  setAssumptionConversationId: (id: string | null) => void;
  setAssumptionConversationStatus: (status: 'PENDING' | 'COMPLETE' | null) => void;
  setStep3Feedback: (feedback: string) => void;
  setStep3Files: (files: File[]) => void;
  addStep3File: (file: File) => void;
  removeStep3File: (index: number) => void;
  resetAll: () => void;
}

export const useCreationVehicleStore = create<CreationVehicleStore>()(
  devtools(
    (set, get) => ({
      featureTags: '',
      step: 1,
      date: null,
      estimatedCompletionDate: null,
      vehicleId: null,
      proposedVehicleId: null,
      productRelationship: '',
      involvedTeam: '',
      successMetrics: '',
      priority: '',
      assumptionsText: '',
      assumptionConversationId: null,
      assumptionConversationStatus: null,
      step3Feedback: '',
      step3Files: [],
      setFeatureTags: (data) => set({ featureTags: data }, false, 'setFeatureTags'),
      setDate: (date: Date) => set({ date: date }, false, 'setDate'),
      setEstimatedCompletionDate: (date: Date) => set({ estimatedCompletionDate: date }, false, 'setEstimatedCompletionDate'),
      setVehicleId: (id: number) => set({ vehicleId: id }, false, 'setVehicleId'),
      setProposedVehicleId: (id: number | null) => set({ proposedVehicleId: id }, false, 'setProposedVehicleId'),
      setProductRelationship: (data: string) => set({ productRelationship: data }, false, 'setProductRelationship'),
      setInvolvedTeam: (data: string) => set({ involvedTeam: data }, false, 'setInvolvedTeam'),
      setSuccessMetrics: (data: string) => set({ successMetrics: data }, false, 'setSuccessMetrics'),
      setPriority: (data: string) => set({ priority: data }, false, 'setPriority'),
      setAssumptionsText: (text: string) => set({ assumptionsText: text }, false, 'setAssumptionsText'),
      setAssumptionConversationId: (id: string | null) => set({ assumptionConversationId: id }, false, 'setAssumptionConversationId'),
      setAssumptionConversationStatus: (status: 'PENDING' | 'COMPLETE' | null) => set({ assumptionConversationStatus: status }, false, 'setAssumptionConversationStatus'),
      setStep3Feedback: (feedback: string) => set({ step3Feedback: feedback }, false, 'setStep3Feedback'),
      setStep3Files: (files: File[]) => set({ step3Files: files }, false, 'setStep3Files'),
      addStep3File: (file: File) => set((state) => ({ step3Files: [...state.step3Files, file] }), false, 'addStep3File'),
      removeStep3File: (index: number) => set((state) => ({ step3Files: state.step3Files.filter((_, i) => i !== index) }), false, 'removeStep3File'),
      vehicleData: {
        name: '',
        description: '',
      },
      vehicleMembers: [],

      incrementStep: () => set({ step: get().step + 1 }, false, 'incrementStep'),
      decrimentStep: () => set({ step: get().step - 1 }, false, 'decrimentStep'),
      setVehicleData: (data) => set({ vehicleData: { ...data } }, false, 'setVehicleData'),
      setMembers: (members) => set({ vehicleMembers: members }, false, 'setMembers'),
      resetAll: () =>
        set({
          step: 1,
          vehicleId: null,
          proposedVehicleId: null,
          productRelationship: '',
          involvedTeam: '',
          successMetrics: '',
          priority: '',
          featureTags: '',
          date: null,
          estimatedCompletionDate: null,
          assumptionsText: '',
          assumptionConversationId: null,
          assumptionConversationStatus: null,
          step3Feedback: '',
          step3Files: [],
          vehicleData: {
            name: '',
            description: '',
          },
          vehicleMembers: [],
        }, false, 'resetAll'),
    }),
    {
      name: 'vehicle-creation-store',
    }
  )
);
