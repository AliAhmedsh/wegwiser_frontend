import { create } from 'zustand';

export interface PrdUpdateFlowContext {
  productId?: number;
  prdId?: string;
  changedBy?: number;
  initialRequest?: string;
}

interface ModalWindowStoreInterface {
  postProductCreation: boolean;
  setPostProductCreation: (value: boolean) => void;
  simulationCreated: boolean;
  setSimulationCreated: (value: boolean) => void;
  iconographyPopupOpen: boolean;
  setIconographyPopupOpen: (value: boolean) => void;
  openProductWorkspaceForPrdUpdate: boolean;
  setOpenProductWorkspaceForPrdUpdate: (value: boolean) => void;
  prdUpdateFlowOpen: boolean;
  prdUpdateFlowContext: PrdUpdateFlowContext | null;
  setPrdUpdateFlowOpen: (value: boolean) => void;
  setPrdUpdateFlowContext: (ctx: PrdUpdateFlowContext | null) => void;
}

export const useModalWindowStore = create<ModalWindowStoreInterface>((set) => ({
  postProductCreation: false,
  setPostProductCreation: (value) => set({ postProductCreation: value }),
  simulationCreated: false,
  setSimulationCreated: (value) => set({ simulationCreated: value }),
  iconographyPopupOpen: false,
  setIconographyPopupOpen: (value) => set({ iconographyPopupOpen: value }),
  openProductWorkspaceForPrdUpdate: false,
  setOpenProductWorkspaceForPrdUpdate: (value) => set({ openProductWorkspaceForPrdUpdate: value }),
  prdUpdateFlowOpen: false,
  prdUpdateFlowContext: null,
  setPrdUpdateFlowOpen: (value) => set({ prdUpdateFlowOpen: value }),
  setPrdUpdateFlowContext: (ctx) => set({ prdUpdateFlowContext: ctx }),
}));
